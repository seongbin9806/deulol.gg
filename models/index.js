const mongoose = require('mongoose'); // MongoDB와 연결하기 위한 Mongoose 라이브러리
const Account = require('./account'); // 유저 모델

/**
 * MongoDB 연결 설정 및 이벤트 처리
 * - 데이터베이스 연결 및 오류/재연결 이벤트를 처리합니다.
 */
const connect = () => {
    mongoose.set('strictPopulate', false); // strictPopulate 비활성화 (Mongoose 7 이상 옵션)
    mongoose
        .connect(process.env.MONGODB_URI, { // 환경 변수에서 MongoDB URI를 가져와 연결
            useNewUrlParser: true, // 새로운 URL 파서 사용
            useUnifiedTopology: true, // 새로운 서버 발견 및 모니터링 엔진 사용
        })
        .then(() => {
            console.log('MongoDB 연결 성공');
        })
        .catch((err) => {
            console.error('MongoDB 연결 에러', err);
        });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB 연결 에러', err); // 연결 중 에러 발생 시 로그 출력
    });

    mongoose.connection.on('disconnected', () => {
        console.error('MongoDB 연결이 끊겼습니다. 재연결 시도...');
        connect(); // 연결 끊김 시 재연결 시도
    });
};

module.exports = { connect, Account }; // 연결 함수와 모델들을 모듈로 내보냄
