const express = require('express');
const axios = require('axios');
const router = express.Router();
const Account = require('../models/account'); // 유저 모델
const { getAndUpdateAccount, setSummonerInfoByPuuid, timeAgo } = require('../services/accountService');

/* 유저 검색창 */
router.get('/', (req, res, next) => {
    try {
        res.render('main');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/* 유저 전적창 */
router.get('/summoner/:userName', async (req, res, next) => {
    try {
        // URL 파라미터를 디코딩
        const userName = decodeURIComponent(req.params.userName);
        
        // userName을 - 기준으로 분리
        const [gameName, tagLine] = userName.split('-');
        let accountData = null;
        
        if(gameName != null && tagLine != null) {
            // 계정 정보 가져오기 및 저장/업데이트
            accountData = await getAndUpdateAccount(gameName, tagLine);

            if(accountData != null){ 

                // 유저가 처음 검색된 거면 유저 상세정보 입력 처리
                if(accountData.isFirst) {
                    await setSummonerInfoByPuuid(accountData.puuid);
                }
            
                accountData = await Account.findOne({ puuid: accountData.puuid });
                
                /* 총합 계산 */
                if (accountData.soloRankWins !== undefined && accountData.soloRankLosses !== undefined) {
                    accountData.totalSoloRank = accountData.soloRankWins + accountData.soloRankLosses;
                    accountData.soloRankRate = ((accountData.soloRankWins / accountData.totalSoloRank) * 100).toFixed(2);
                } else {
                    accountData.totalSoloRank = 0;
                    accountData.soloRankRate = 0;
                }

                if (accountData.flexRankWins !== undefined && accountData.flexRankLosses !== undefined) {
                    accountData.totalFlexRank = accountData.flexRankWins + accountData.flexRankLosses;
                    accountData.flexRankRate = ((accountData.flexRankWins / accountData.totalFlexRank) * 100).toFixed(2);
                } else {
                    accountData.totalFlexRank = 0;
                    accountData.flexRankRate = 0;
                }

                accountData.formatLastUpdateDate = timeAgo(accountData.lastUpdateDate);
            }
        }
        // 계정 정보가 있을 경우 summoner 페이지로 렌더링
        res.render('summoner', { accountData, gameName, tagLine});
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;