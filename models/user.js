const mongoose = require('mongoose');
const { Schema } = mongoose; // Mongoose Schema를 사용하여 데이터 구조 정의

/**
 * 사용자 스키마 정의
 * - 사용자 정보, 인증 정보, 그리고 팔로우 관계를 저장합니다.
 */
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true, // 이메일 필수
      unique: true, // 고유 값 설정
    },
    nick: {
      type: String,
      required: true, // 닉네임 필수
      maxlength: 15, // 최대 15자 제한
    },
    password: {
      type: String,
      required: true, // 비밀번호 필수
    },
    provider: {
      type: String,
      default: 'local', // 인증 제공자 (기본값: 로컬)
    },
    snsId: {
      type: String, // 소셜 로그인 시 사용할 SNS ID
    },
    Followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 팔로워 ID 목록 (자기 참조)
      default: [],
    },
    Followings: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 팔로잉 ID 목록 (자기 참조)
      default: [],
    },
  },
  {
    timestamps: true, // 생성 및 수정 시간을 자동으로 기록
  }
);

module.exports = mongoose.model('User', userSchema); // 'User' 모델로 내보냄
