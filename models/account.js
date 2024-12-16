const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 계정 스키마 정의
 * - 유저 고유 아이디, 게임 이름, 태그라인, 프로필 아이콘 ID, 소환사 레벨 등을 저장합니다.
 */
const AccountSchema = new Schema(
    {
        puuid: {
            type: String,
            required: true, // 유저 고유 아이디
            maxlength: 100, // 최대 100자 제한
        },
        gameName: {
            type: String,
            maxlength: 50, // 최대 50자 제한
        },
        tagLine: {
            type: String,
            maxlength: 50, // 최대 50자 제한
        },
        profileIconId: {
            type: Number, // 프로필 아이콘 ID는 정수형으로 저장
        },
        summonerLevel: {
            type: Number, // 소환사 레벨은 정수형으로 저장
        },
        soloRankTier: {
            type: String,
            maxlength: 50, // 최대 50자 제한
        },
        soloRankRank: {
            type: String,
            maxlength: 10, // 최대 10자 제한
        },
        soloRankLP: {
            type: Number, // 리그 포인트는 정수형으로 저장
        },
        soloRankWins: {
            type: Number, // 승리한 게임 수는 정수형으로 저장
        },
        soloRankLosses: {
            type: Number, // 패배한 게임 수는 정수형으로 저장
        },
        flexRankTier: {
            type: String,
            maxlength: 50, // 최대 50자 제한
        },
        flexRankRank: {
            type: String,
            maxlength: 10, // 최대 10자 제한
        },
        flexRankLP: {
            type: Number, // 리그 포인트는 정수형으로 저장
        },
        flexRankWins: {
            type: Number, // 승리한 게임 수는 정수형으로 저장
        },
        flexRankLosses: {
            type: Number, // 패배한 게임 수는 정수형으로 저장
        },
        lastUpdateDate: {
            type: Date, // 마지막 업데이트 날짜와 시간을 저장하기 위해 Date 타입을 사용
        },
    },
    {
        timestamps: true, // 생성 및 수정 시간을 자동으로 기록
    }
);

module.exports = mongoose.model('Account', AccountSchema); // 'Account' 모델로 내보냄