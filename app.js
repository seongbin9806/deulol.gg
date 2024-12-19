require('dotenv').config(); // 환경 변수 로드
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const nunjucks = require('nunjucks');

// 작성 코드 연결
const db = require('./models');
const pageRouter = require('./routes/page');
const accountRouter = require('./routes/account');
const youtubeRouter = require('./routes/youtube');

const app = express();

// 포트 설정 및 템플릿 엔진 구성
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true, // 템플릿 변경 시 자동 업데이트
});

// MongoDB 연결
db.connect(); // 데이터베이스 연결 설정 및 오류 시 재연결 로직 포함

// 1. 요청 로깅 미들웨어
// 요청 정보를 콘솔에 기록하여 디버깅과 모니터링에 도움
app.use(morgan('dev'));

// 2. 정적 파일 제공 미들웨어
// 브라우저가 /public 및 /img 경로의 정적 파일을 요청하면 해당 파일을 즉시 응답
app.use(express.static(path.join(__dirname, 'public')));

// 3. 요청 본문 데이터 파싱 미들웨어
// JSON 데이터와 URL-encoded 데이터를 각각 파싱하여 `req.body`에 저장
app.use(express.json()); // JSON 본문 데이터 처리
app.use(express.urlencoded({ extended: false })); // 폼 데이터 처리

// 4. 라우터 등록
// 각각의 경로에 해당하는 요청 처리 로직을 연결
app.use('/', pageRouter); // 메인관련 요청 처리
app.use('/', accountRouter); // 유저관련 요청 처리
app.use('/', youtubeRouter); // 유튜브관련 요청 처리

// 5. 404 에러 처리 미들웨어
// 등록되지 않은 경로로 요청이 들어올 경우 처리
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error); // 에러 처리 미들웨어로 전달
});

// 에러 처리 미들웨어
// 요청 처리 중 발생한 에러를 처리하여 사용자에게 응답
app.use((err, req, res, next) => {
  res.locals.message = err.message; // 에러 메시지 전달
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 개발 환경에서만 에러 스택 표시
  res.status(err.status || 500); // 에러 상태 코드 설정
  res.render('error'); // error.html 템플릿 렌더링
});

// 서버 실행
// 지정된 포트에서 Express 서버를 실행
app.listen(app.get('port'), '0.0.0.0', () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
