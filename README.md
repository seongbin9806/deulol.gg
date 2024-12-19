# deulol.gg

## 프로젝트 개요
`deulol.gg`는 Node.js와 MongoDB를 기반으로 한 리그 오브 레전드 전적 검색 웹 애플리케이션입니다. 
Riot Games API를 사용하여 플레이어의 전적을 조회하고, 이를 시각적으로 제공합니다.

## 주요 기능
- 소환사명 및 태그를 통해 플레이어 검색
- 개인전 및 자유랭크 정보 제공
- 최근 게임 전적 조회
- 플레이어의 상세 전적 제공
- 머신러닝 APISCORE 제공

## 사용 기술
- **프론트엔드**: HTML, CSS, JavaScript
- **백엔드**: Node.js, Express.js, python
- **데이터베이스**: MongoDB
- **API**: Riot Games API, Youtube API

## 설치 및 실행 방법

### 1. 클론 및 의존성 설치
먼저, 저장소를 클론하고 필요한 의존성을 설치합니다.
git clone https://github.com/yourusername/deulol.gg.git
cd deulol.gg
npm install

### 2. 환경 변수 설정
프로젝트 루트 디렉토리에 .env 파일을 생성하고 다음과 같은 환경 변수를 설정합니다.
(your_riot_api_key 발급 - https://developer.riotgames.com/apis)
PORT=8083
MONGODB_URI=mongodb://localhost:27017/deugg
RAPID_API_KEY=your_riot_api_key
REGION=asia
COUNTRY=kr

### 3. 실행
- node
1. node app.js - 8083 포트에서 실행

- python
1. /python 폴더로이동
2. python flask_server.py - 8090 포트에서 실행

### 4. 결과 확인
http://localhost:8083
