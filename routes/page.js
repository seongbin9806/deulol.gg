const express = require('express');
const axios = require('axios');
const router = express.Router();
const Account = require('../models/account'); // 유저 모델

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

        // 계정 정보 가져오기 및 저장/업데이트
        let accountData = await getAndUpdateAccount(gameName, tagLine);

        if(accountData != null){ 

            // 유저가 처음 검색된 거면 유저 상세정보 입력 처리
            if(accountData.isFirst) {
                await setSummonerInfoByPuuid(accountData.puuid);
            }
         
            accountData = await Account.findOne({ puuid: accountData.puuid });

            /* 총합 계산 */
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
        // 계정 정보가 있을 경우 summoner 페이지로 렌더링
        res.render('summoner', { accountData, gameName, tagLine});
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/**
 * 계정 정보를 가져와서 DB에 저장하거나 업데이트하는 함수
 * @param {String} gameName - 게임 이름
 * @param {String} tagLine - 게임 태그
 */
async function getAndUpdateAccount(gameName, tagLine) {
    try {
        const apiKey = process.env.RAPID_API_KEY; // .env 파일에서 apiKey 가져오기
        const region = process.env.REGION; // .env 파일에서 region 가져오기
        const accountApiUrl = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id`,
              accountFullApiUrl = `${accountApiUrl}/${gameName}/${tagLine}?api_key=${apiKey}`;
        
        let accountData = null; // accountData 초기화

        try {
            const accountRes = await axios.get(accountFullApiUrl);
            accountData = accountRes.data;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // 404 오류 발생 시, 유저 정보가 없다는 메시지를 출력하고 null 반환
                console.error('유저 정보를 찾을 수 없습니다.');
                return null;
            } else {
                throw err; // 다른 오류가 발생하면 재던지기
            }
        }
        // Account 모델에서 puuid로 이미 존재하는지 확인
        const existingAccount = await Account.findOne({ puuid: accountData.puuid });

        //처음 검색 되는지 여부 
        accountData.isFirst = true;

        if (!existingAccount) {
            // 만약 puuid가 존재하지 않으면 INSERT
            const newAccount = new Account({
                puuid: accountData.puuid,
                gameName: accountData.gameName,
                tagLine: accountData.tagLine
            });
            await newAccount.save(); // DB에 새 계정 저장
            console.log("새 계정이 추가되었습니다.");
        } else {
            // 만약 puuid가 존재한다면 UPDATE 처리
            existingAccount.gameName = accountData.gameName;
            existingAccount.tagLine = accountData.tagLine;
            await existingAccount.save(); // DB에 업데이트된 계정 저장

            accountData.isFirst = false;
            console.log("기존 계정이 업데이트되었습니다.");
        }

        return accountData; // 계정 데이터를 반환
    } catch (error) {
        console.error('계정 정보를 가져오는 데 실패했습니다.', error);
        throw error; // 호출한 곳에서 에러를 처리하도록 전달
    }
}

/**
 * 유저 상세정보 업데이트 함수
 * @param {String} puuid - 플레이어 고유번호
 */
async function setSummonerInfoByPuuid(puuid) {
    const apiKey = process.env.RAPID_API_KEY;
    const country = process.env.COUNTRY;
    const summonerUrl = `https://${country}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${apiKey}`;
    const leagueUrl = `https://${country}.api.riotgames.com/lol/league/v4/entries/by-summoner`;

    try {
        // 소환사 정보 가져오기
        const response = await axios.get(summonerUrl);
        const summonerInfo = response.data;

        // DB에서 해당 puuid에 해당하는 유저를 찾아서 업데이트
        const existingAccount = await Account.findOne({ puuid: puuid });

        if (existingAccount) {
            // 개인전 랭크 정보 가져오기
            const soloRankResponse = await axios.get(`${leagueUrl}/${summonerInfo.id}?api_key=${apiKey}`);
            const leagueEntries = soloRankResponse.data;
            console.log(leagueEntries);
            // 랭크 정보를 저장할 변수 초기화
            let soloRank = null;
            let flexRank = null;

            // 리그 엔트리 데이터를 순회하며 개인전과 자유랭크 정보를 추출
            leagueEntries.forEach(entry => {
                if (entry.queueType === 'RANKED_SOLO_5x5') {
                    soloRank = entry;
                } else if (entry.queueType === 'RANKED_FLEX_SR') {
                    flexRank = entry;
                }
            });

            // 해당 계정이 이미 존재한다면, 업데이트
            existingAccount.profileIconId = summonerInfo.profileIconId;
            existingAccount.revisionDate = summonerInfo.revisionDate;
            existingAccount.summonerLevel = summonerInfo.summonerLevel;

            if (soloRank) {
                existingAccount.soloRankTier = soloRank.tier;
                existingAccount.soloRankRank = soloRank.rank;
                existingAccount.soloRankLP = soloRank.leaguePoints;
                existingAccount.soloRankWins = soloRank.wins;
                existingAccount.soloRankLosses = soloRank.losses;
            }

            if (flexRank) {
                existingAccount.flexRankTier = flexRank.tier;
                existingAccount.flexRankRank = flexRank.rank;
                existingAccount.flexRankLP = flexRank.leaguePoints;
                existingAccount.flexRankWins = flexRank.wins;
                existingAccount.flexRankLosses = flexRank.losses;
            }

            // 마지막 업데이트 시간 업데이트
            existingAccount.lastUpdateDate = new Date(); // 현재 시간을 설정

            await existingAccount.save(); // 업데이트된 데이터 저장
            console.log('유저 정보가 성공적으로 업데이트되었습니다.');
        } else {
            console.log('해당 puuid에 대한 유저 정보가 존재하지 않습니다.');
        }
    } catch (error) {
        console.error('Error fetching summoner info:', error);
        throw error; // 에러를 호출한 곳으로 던져서 처리하도록 함
    }
}

function timeAgo(dateString) {
    const date = new Date(dateString); // ISO 8601 형식의 문자열을 Date 객체로 변환
    const now = new Date();
    const secondsPast = Math.floor((now - date) / 1000);

    if (secondsPast < 60) {
        return `방금 전`;
    }
    if (secondsPast < 3600) {
        const minutesPast = Math.floor(secondsPast / 60);
        return `${minutesPast}분 전`;
    }
    if (secondsPast <= 86400) {
        const hoursPast = Math.floor(secondsPast / 3600);
        return `${hoursPast}시간 전`;
    }
    if (secondsPast <= 2592000) {
        const daysPast = Math.floor(secondsPast / 86400);
        return `${daysPast}일 전`;
    }
    if (secondsPast <= 31536000) {
        const monthsPast = Math.floor(secondsPast / 2592000);
        return `${monthsPast}개월 전`;
    }
    const yearsPast = Math.floor(secondsPast / 31536000);
    return `${yearsPast}년 전`;
}


module.exports = router;