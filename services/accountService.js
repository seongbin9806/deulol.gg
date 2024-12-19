const axios = require('axios');
const Account = require('../models/account'); // Account 모델 경로에 맞게 수정

/**
 * 계정 정보를 가져와서 DB에 저장하거나 업데이트하는 함수
 * @param {String} gameName - 게임 이름
 * @param {String} tagLine - 게임 태그
 */
async function getAndUpdateAccount(gameName, tagLine) {
    try {
        const apiKey = process.env.RAPID_API_KEY;
        const region = process.env.REGION;
        const accountApiUrl = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id`;
        const accountFullApiUrl = `${accountApiUrl}/${gameName}/${tagLine}?api_key=${apiKey}`;

        let accountData = null;

        try {
            const accountRes = await axios.get(accountFullApiUrl);
            accountData = accountRes.data;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                console.error('유저 정보를 찾을 수 없습니다.');
                return null;
            } else {
                throw err;
            }
        }

        const existingAccount = await Account.findOne({ puuid: accountData.puuid });
        accountData.isFirst = true;

        if (!existingAccount) {
            const newAccount = new Account({
                puuid: accountData.puuid,
                gameName: accountData.gameName,
                tagLine: accountData.tagLine
            });
            await newAccount.save();
            console.log("새 계정이 추가되었습니다.");
        } else {
            existingAccount.gameName = accountData.gameName;
            existingAccount.tagLine = accountData.tagLine;
            await existingAccount.save();

            accountData.isFirst = false;
            console.log("기존 계정이 업데이트되었습니다.");
        }

        return accountData;
    } catch (error) {
        console.error('계정 정보를 가져오는 데 실패했습니다.', error);
        throw error;
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
        const response = await axios.get(summonerUrl);
        const summonerInfo = response.data;

        const existingAccount = await Account.findOne({ puuid: puuid });

        if (existingAccount) {
            const soloRankResponse = await axios.get(`${leagueUrl}/${summonerInfo.id}?api_key=${apiKey}`);
            const leagueEntries = soloRankResponse.data;

            let soloRank = null;
            let flexRank = null;

            leagueEntries.forEach(entry => {
                if (entry.queueType === 'RANKED_SOLO_5x5') {
                    soloRank = entry;
                } else if (entry.queueType === 'RANKED_FLEX_SR') {
                    flexRank = entry;
                }
            });

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

            existingAccount.lastUpdateDate = new Date();

            await existingAccount.save();
            console.log('유저 정보가 성공적으로 업데이트되었습니다.');
        } else {
            console.log('해당 puuid에 대한 유저 정보가 존재하지 않습니다.');
        }
    } catch (error) {
        console.error('Error fetching summoner info:', error);
        throw error;
    }
}

function timeAgo(dateString) {
    const date = new Date(dateString);
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

module.exports = {
    getAndUpdateAccount,
    setSummonerInfoByPuuid,
    timeAgo
};
