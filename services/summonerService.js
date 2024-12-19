const axios = require('axios');
const Account = require('../models/account'); // Account 모델을 임포트
const FLASK_API_URL = 'http://127.0.0.1:8090/ai_score';

/**
 * 매치 ID에 대한 상세 정보를 가져오는 함수
 * @param {String} matchId - 매치 ID
 * @param {String} apiKey - API 키
 * @param {String} region - 리전
 */
async function getMatchDetails(matchId, apiKey, region) {

    await new Promise(resolve => setTimeout(resolve, 50));
    
    const matchDetailUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`;
    const response = await axios.get(matchDetailUrl);
    return response.data;
}

/**
 * 유저 매치 정보 리스트를 가져오는 함수
 * @param {String} puuid - 플레이어 고유번호
 * @param {Number} page - 페이지 번호
 */
async function getUserMatchList(puuid, page) {
    const apiKey = process.env.RAPID_API_KEY;
    const region = process.env.REGION;
    const count = 10;

    const account = await Account.findOne({ puuid: puuid });

    // `account.lastUpdateDate`를 Unix timestamp로 변환 (밀리초 단위)
    const endTime = new Date(account.lastUpdateDate).getTime();

    // Riot API에서 `endTime`을 사용하여 해당 시간보다 이전의 매치들을 가져옵니다.
    let matchListUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;
    matchListUrl += `?endTime=${endTime}&start=${(page - 1) * count}&count=${count}&api_key=${apiKey}`;

    try {
        const matchIdsListRes = await axios.get(matchListUrl);
        let matchIdsList = matchIdsListRes.data;
        let matchDetailsList = [];

        for (let i = 0; i < matchIdsList.length; i++) {
            const matchId = matchIdsList[i];

            try {
                const matchDetails = await getMatchDetails(matchId, apiKey, region);
                
                const userData = matchDetails.info.participants; 
                 
                let aiScoreArr = [];
                for (let index in userData) {
                    let user = userData[index];
                    /* AI SCORE 가져오기 */
                    let kda;
                    if (user.deaths == 0) {
                        // 데스가 0일 경우에는 두개 더하기
                        kda = user.kills + user.assists;
                    } else {
                        kda = (user.kills + user.assists) / user.deaths;
                    }

                    const completeFeatures = {
                        kills: user.kills || 0,
                        assists: user.assists || 0,
                        deaths: user.deaths || 0,
                        kda: kda || 2.0,
                        total_damage: user.totalDamageDealtToChampions || 0,
                        damage_taken: user.totalDamageTaken || 0,
                        heals: user.totalHealsOnTeammates || 0,
                        vision_score: user.visionScore || 0,
                        cs: (user.totalMinionsKilled + user.neutralMinionsKilled) || 0
                    };

                    // 칼바람일 경우 position을 제외하고 보냄
                    const payload = { 
                        position: user.teamPosition === ""? 'ARAM' : user.teamPosition,
                        features: completeFeatures 
                    };
                    const response = await axios.post(FLASK_API_URL, payload);
                    
                    aiScoreArr.push({
                        score: response.data.ai_score,
                        index: index // 인덱스를 함께 저장하여 나중에 참조할 수 있도록
                    });
                }

                // 점수에 따라 내림차순 정렬 (AI 점수를 기준으로)
                aiScoreArr.sort((a, b) => b.score - a.score);

                // 점수 배열을 1등부터 10등까지 순위 매기기
                let rankedScores = aiScoreArr.map((item, index) => ({
                    rank: index + 1,
                    score: item.score,
                    index: item.index // 참가자의 원래 인덱스도 함께 저장
                }));

                // 각 사용자에게 점수와 순위를 할당
                for (let rankedScore of rankedScores) {
                    matchDetails.info.participants[rankedScore.index].aiScore = rankedScore.score;
                    matchDetails.info.participants[rankedScore.index].rank = rankedScore.rank;
                }

                matchDetailsList.push(matchDetails);
            } catch (error) {
                console.error(`Error fetching match details for match ID ${matchId}:`, error);
            }
        }

        return matchDetailsList;

    } catch (error) {
        console.error('Error fetching match list:', error);
        throw error;
    }
}

module.exports = { getUserMatchList };
