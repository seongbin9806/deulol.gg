const axios = require('axios');
const { parseISO, subMonths, isAfter } = require('date-fns');

// 챔피언별 키워드 설정
const championKeywords = {
    "Aatrox": ['롤', '아트록스', '강의'],
    "Ahri": ['롤', '아리', '강의'],
    "Akali": ['롤', '아칼리', '강의'],
    "Akshan": ['롤', '아크샨', '강의'],
    "Alistar": ['롤', '알리스타', '강의'],
    "Ambessa": ['롤', '암베사', '강의'],
    "Amumu": ['롤', '아무무', '강의'],
    "Anivia": ['롤', '애니비아', '강의'],
    "Annie": ['롤', '애니', '강의'],
    "Aphelios": ['롤', '아펠리오스', '강의'],

    "Ashe": ['롤', '애쉬', '강의'],
    "AurelionSol": ['롤', '아우렐리오솔', '강의'],
    "Aurora": ['롤', '오로라', '강의'],
    "Azir": ['롤', '아지르', '강의'],
    "Bard": ['롤', '바드', '강의'],
    "Belveth": ['롤', '벨베스', '강의'],
    "Blitzcrank": ['롤', '블리츠크랭크', '강의'],
    "Brand": ['롤', '브랜드', '강의'],
    "Braum": ['롤', '브라움', '강의'],
    "Briar": ['롤', '브라이어', '강의'],

    "Caitlyn": ['롤', '케이틀린', '강의'],
    "Camille": ['롤', '카밀', '강의'],
    "Cassiopeia": ['롤', '카시오페아', '강의'],
    "Chogath": ['롤', '초가스', '강의'],
    "Corki": ['롤', '코르키', '강의'],
    "Darius": ['롤', '다리우스', '강의'],
    "Diana": ['롤', '다이애나', '강의'],
    "Draven": ['롤', '드레이븐', '강의'],
    "DrMundo": ['롤', '문도', '강의'],
    "Ekko": ['롤', '에코', '강의'],

    "Elise": ['롤', '엘리스', '강의'],
    "Evelynn": ['롤', '이블린', '강의'],
    "Ezreal": ['롤', '이즈리얼', '강의'],
    "Fiddlesticks": ['롤', '피들스틱', '강의'],
    "Fiora": ['롤', '피오라', '강의'],
    "Fizz": ['롤', '피즈', '강의'],
    "Galio": ['롤', '갈리오', '강의'],
    "Gangplank": ['롤', '갱플랭크', '강의'],
    "Garen": ['롤', '가렌', '강의'],
    "Gnar": ['롤', '나르', '강의'],

    "Gragas": ['롤', '그라가스', '강의'],
    "Graves": ['롤', '그레이브즈', '강의'],
    "Gwen": ['롤', '그웬', '강의'],
    "Hecarim": ['롤', '헤카림', '강의'],
    "Heimerdinger": ['롤', '하이머딩거', '강의'],
    "Hwei": ['롤', '흐웨이', '강의'],
    "Illaoi": ['롤', '일라오이', '강의'],
    "Irelia": ['롤', '이렐리아', '강의'],
    "Ivern": ['롤', '아이번', '강의'],
    "Janna": ['롤', '잔나', '강의'],

    "JarvanIV": ['롤', '자르반 4세', '강의'],
    "Jax": ['롤', '잭스', '강의'],
    "Jayce": ['롤', '제이스', '강의'],
    "Jhin": ['롤', '진', '강의'],
    "Jinx": ['롤', '징크스', '강의'],
    "Kaisa": ['롤', '카이사', '강의'],
    "Kalista": ['롤', '칼리스타', '강의'],
    "Karma": ['롤', '카르마', '강의'],
    "Karthus": ['롤', '카서스', '강의'],
    "Kassadin": ['롤', '카사딘', '강의'],

    "Katarina": ['롤', '카타리나', '강의'],
    "Kayle": ['롤', '케일', '강의'],
    "Kayn": ['롤', '케인', '강의'],
    "Kennen": ['롤', '케넨', '강의'],
    "Khazix": ['롤', '카직스', '강의'],
    "Kindred": ['롤', '킨드레드', '강의'],
    "Kled": ['롤', '클레드', '강의'],
    "KogMaw": ['롤', '코그모', '강의'],
    "KSante": ['롤', '크산테', '강의'],
    "Leblanc": ['롤', '르블랑', '강의'],

    "LeeSin": ['롤', '리신', '강의'],
    "Leona": ['롤', '레오나', '강의'],
    "Lillia": ['롤', '릴리아', '강의'],
    "Lissandra": ['롤', '리산드라', '강의'],
    "Lucian": ['롤', '루시안', '강의'],
    "Lulu": ['롤', '룰루', '강의'],
    "Lux": ['롤', '럭스', '강의'],
    "Malphite": ['롤', '말파이트', '강의'],
    "Malzahar": ['롤', '말자하', '강의'],
    "Maokai": ['롤', '마오카이', '강의'],

    "MasterYi": ['롤', '마스터이', '강의'],
    "Milio": ['롤', '밀리오', '강의'],
    "MissFortune": ['롤', '미스포츈', '강의'],
    "MonkeyKing": ['롤', '오공', '강의'],
    "Mordekaiser": ['롤', '모데카이저', '강의'],
    "Morgana": ['롤', '모르가나', '강의'],
    "Naafiri": ['롤', '나피리', '강의'],
    "Nami": ['롤', '나미', '강의'],
    "Nasus": ['롤', '나서스', '강의'],
    "Nautilus": ['롤', '노틸러스', '강의'],

    "Neeko": ['롤', '니코', '강의'],
    "Nidalee": ['롤', '니달리', '강의'],
    "Nilah": ['롤', '닐라', '강의'],
    "Nocturne": ['롤', '녹턴', '강의'],
    "Nunu": ['롤', '누누', '강의'],
    "Olaf": ['롤', '올라프', '강의'],
    "Orianna": ['롤', '오리아나', '강의'],
    "Ornn": ['롤', '오른', '강의'],
    "Pantheon": ['롤', '판테온', '강의'],
    "Poppy": ['롤', '뽀삐', '강의'],

    "Pyke": ['롤', '파이크', '강의'],
    "Qiyana": ['롤', '키아나', '강의'],
    "Quinn": ['롤', '퀸', '강의'],
    "Rakan": ['롤', '라칸', '강의'],
    "Rammus": ['롤', '람머스', '강의'],
    "RekSai": ['롤', '렉사이', '강의'],
    "Rell": ['롤', '렐', '강의'],
    "Renata": ['롤', '레나타', '강의'],
    "Renekton": ['롤', '레넥톤', '강의'],
    "Rengar": ['롤', '렝가', '강의'],

    "Riven": ['롤', '리븐', '강의'],
    "Rumble": ['롤', '럼블', '강의'],
    "Ryze": ['롤', '라이즈', '강의'],
    "Samira": ['롤', '사미라', '강의'],
    "Sejuani": ['롤', '세주아니', '강의'],
    "Senna": ['롤', '세나', '강의'],
    "Seraphine": ['롤', '세라핀', '강의'],
    "Sett": ['롤', '세트', '강의'],
    "Shaco": ['롤', '샤코', '강의'],
    "Shen": ['롤', '쉔', '강의'],

    "Shyvana": ['롤', '쉬바나', '강의'],
    "Singed": ['롤', '신지드', '강의'],
    "Sion": ['롤', '사이온', '강의'],
    "Sivir": ['롤', '시비르', '강의'],
    "Skarner": ['롤', '스카너', '강의'],
    "Smolder": ['롤', '스몰더', '강의'],
    "Sona": ['롤', '소나', '강의'],
    "Soraka": ['롤', '소라카', '강의'],
    "Swain": ['롤', '스웨인', '강의'],
    "Sylas": ['롤', '사일러스', '강의'],

    "Syndra": ['롤', '신드라', '강의'],
    "TahmKench": ['롤', '탐켄치', '강의'],
    "Taliyah": ['롤', '탈리야', '강의'],
    "Talon": ['롤', '탈론', '강의'],
    "Taric": ['롤', '타릭', '강의'],
    "Teemo": ['롤', '티모', '강의'],
    "Thresh": ['롤', '쓰레쉬', '강의'],
    "Tristana": ['롤', '트리스타나', '강의'],
    "Trundle": ['롤', '트런들', '강의'],
    "Tryndamere": ['롤', '트린다미어', '강의'],

    "TwistedFate": ['롤', '트위스트페이트', '강의'],
    "Twitch": ['롤', '트위치', '강의'],
    "Udyr": ['롤', '우디르', '강의'],
    "Urgot": ['롤', '우르곳', '강의'],
    "Varus": ['롤', '바루스', '강의'],
    "Vayne": ['롤', '베인', '강의'],
    "Veigar": ['롤', '베이가', '강의'],
    "Velkoz": ['롤', '벨코즈', '강의'],
    "Vex": ['롤', '벡스', '강의'],
    "Vi": ['롤', '바이', '강의'],

    "Viego": ['롤', '비에고', '강의'],
    "Viktor": ['롤', '빅토르', '강의'],
    "Vladimir": ['롤', '블라디미르', '강의'],
    "Volibear": ['롤', '볼리베어', '강의'],
    "Warwick": ['롤', '워윅', '강의'],
    "Xayah": ['롤', '자야', '강의'],
    "Xerath": ['롤', '제라스', '강의'],
    "XinZhao": ['롤', '신짜오', '강의'],
    "Yasuo": ['롤', '야스오', '강의'],
    "Yone": ['롤', '요네', '강의'],

    "Yorick": ['롤', '요릭', '강의'],
    "Yuumi": ['롤', '유미', '강의'],
    "Zac": ['롤', '자크', '강의'],
    "Zed": ['롤', '제드', '강의'],
    "Zeri": ['롤', '제리', '강의'],
    "Ziggs": ['롤', '직스', '강의'],
    "Zilean": ['롤', '질리언', '강의'],
    "Zoe": ['롤', '조이', '강의'],
    "Zyra": ['롤', '자이라', '강의']
}

const FORBIDDEN_KEYWORDS = ["롤토체스", "TFT", "와일드"];
const YOUTUBE_API_KEY = "AIzaSyDA8eQRfOz02H9a4p4PtGeuZor3BFevcY0";

// 유튜브 영상 가져오기
async function getYouTubeVideos(champion) {

    const keywords = generateSearchKeywords(champion);
    const query = keywords.join(" ");
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=10&order=date&key=${YOUTUBE_API_KEY}`;

    try {
        const response = await axios.get(searchUrl);
        const videos = response.data.items;

        // 현재 날짜 기준 4개월 전 날짜 계산
        const fourMonthsAgo = subMonths(new Date(), 4);

        // 금지 키워드 필터링 및 업로드 날짜 필터링
        const filteredVideos = videos.filter(video => {
            const title = video.snippet.title;
            const publishedAt = parseISO(video.snippet.publishedAt); // 업로드 날짜 파싱

            return (
                !FORBIDDEN_KEYWORDS.some(keyword => title.includes(keyword)) && // 금지 키워드 제외
                isAfter(publishedAt, fourMonthsAgo) // 4개월 이내 영상만 포함
            );
        });

        return filteredVideos;
    } catch (error) {
        console.error("유튜브 API 호출 오류:", error.response ? error.response.data : error.message);
        return [];
    }
}

function generateSearchKeywords(championName) {
    if (championKeywords[championName]) {
        return championKeywords[championName].map(keyword => `${championName} ${keyword}`);
    } else {
        return [`${championName} 가이드`];
    }
}

module.exports = { getYouTubeVideos };