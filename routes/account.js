const express = require('express');
const router = express.Router();
const Account = require('../models/account'); // 유저 모델
const { setSummonerInfoByPuuid } = require('../services/accountService');
const { getUserMatchList } = require('../services/summonerService');

/* 검색에 따라 유저리스트 가져오기 */
router.post('/account/getUserList', async (req, res, next) => {
    try {
        const { searchUserName } = req.body;

        // LIKE 연산자를 대신하기 위해 정규 표현식을 사용하여 부분 일치를 검색
        const accounts = await Account.find({
            $or: [
                { gameName: new RegExp(searchUserName, 'i') },
                { tagLine: new RegExp(searchUserName, 'i') },
                { $expr: { $regexMatch: { input: { $concat: ["$gameName", "#", "$tagLine"] }, regex: searchUserName, options: 'i' } } }
            ]
        });

        // 검색된 유저 목록을 리턴
        res.json(accounts);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/* 유저 전적갱신 */
router.post('/account/updateInfo/:puuid', async (req, res, next) => {
    try {
        const puuid = req.params.puuid;

        await setSummonerInfoByPuuid(puuid);

        // 검색된 유저 목록을 리턴
        res.json({
            result: true,
            msg: "유저 전적갱신 성공"
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/* 유저 전적리스트 */
router.post('/account/getUserMatchList/:puuid/:page', async (req, res, next) => {
    try {
        const puuid = req.params.puuid;
        const page = req.params.page;
        
        let matchList = await getUserMatchList(puuid, page);

        // 검색된 유저 목록을 리턴
        res.json({ matchList: matchList });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;