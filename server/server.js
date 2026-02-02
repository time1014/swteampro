const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const db = require('./db'); // db 모듈 가져오기


const app = express();
app.use(express.json());
app.use(cors());

const path = require('path');

app.set('view engine', 'html'); 
app.set('views', path.join(__dirname, 'views')); 

let currentMatchGet=0;
let currentMatchPost=0;

const PORT = process.env.PORT || 3001;

// database 모듈 불러오기
const { initializeDatabase, getRecentKeywords, saveTournament, closeDatabase, updateKeywordStats, a} = require('./db');

// 데이터베이스 초기화
initializeDatabase().catch(err => console.error("Failed to connect to database", err));

let extractedItems= ['1번 후보','2번 후보'];
let tournament = [['1번 후보','2번 후보'],['3번 후보','4번 후보'],['1번 후보','2번 후보'],['3번 후보','4번 후보']];//createTournamentBracket(extractedItems);
let tournamentImg={};//이거를 json마냥 키와 값으로 저장해야되나? 이것도 섞기 귀찮은디. 애초에 extractedItems만들때가 아닌 tournament만들때 섞임. 그러나 img는 extractedItems만들때 생성 -> 걍 dict마냥 만들자. 단 같은 이름 나오면 골치 아파짐!! 이거 중요
tournamentImg={'1번 후보':'https://placehold.co/600x400','2번 후보':'https://placehold.co/600x400','3번 후보':'https://placehold.co/600x400','4번 후보':'https://placehold.co/600x400'};//초기화
let winItems=[];



app.get('/qw', (req, res) => { //3001주의. 테스트 환경
    res.render('/')
});

let g;
let g2;
let  prompt="키워드";

app.post('/setkeyword', async (req, res) => {
    //시작하면 초기화 하는 부분
    endChk=0;
    finalChk=0;
    DeLi={};
    winItems=[];
    currentMatchGet=0;
    currentMatchPost=0;
    tournamentImg={};
    
    const {gender, ageGroup, GameNumber } = req.body;
    g=gender;
    g2=ageGroup;

    prompt  = req.body.keyword;
    console.log("Received prompt:", prompt); // 입력 받은 키워드 로깅
    const startTime = Date.now();  // 요청 시작 시간 기록

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: "You are a helpful assistant." }, 
                        { role: "user", content: prompt+'을/를 주제로 이상형월드컵을 진행하려고 한다.이상형 월드컵을 진행하기 위한 선택지를 중복된 값이 없도록 설명없이 '+GameNumber+'가지 말해.(숫자 붙여서)' }]
            },
            {
                headers: {
                    'Authorization': 'Bearer '+process.env.OPENAI_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        const endTime = Date.now();  // 응답 완료 시간 기록
        const responseTimeMs = endTime - startTime;  // 전체 응답 시간 계산 (밀리초)
        const responseTimeSeconds = (responseTimeMs / 1000).toFixed(2); // 초 단위로 변환하고, 소수점 둘째자리까지 표시

        const textResponse = response.data.choices[0].message.content;  // API 응답에서 텍스트 추출
        console.log("GPT API Response:", textResponse);  // API 응답 로깅
        console.log("Total Response Time:", responseTimeMs, "ms");  // 전체 응답 시간 로깅
        console.log("Total Response Time in seconds:", responseTimeSeconds, "seconds");  // 전체 응답 시간을 초 단위로 로깅


        // 숫자로 시작하는 항목 추출
        extractedItems = textResponse.split('\n').map(line => {
            const match = line.match(/^\d+\.\s+(.+)/); // 정규 표현식 수정
            return match ? match[1] : null;
        }).filter(Boolean);

        console.log("Extracted Items:", extractedItems); // 추출된 항목 목록 로깅
        
        
        async function SearchImgs(){
            for(let i=0;i<extractedItems.length;i++){
                triggersearch(extractedItems[i])
                .then(response => tournamentImg[extractedItems[i]]=response)
            }
        }
        
        const startTime2 = Date.now();  // 요청 시작 시간 기록

        await SearchImgs();

        const whileTime=setInterval(()=>{
            console.dir(Object.keys(tournamentImg).length);
            console.dir(extractedItems.length)
            if(Object.keys(tournamentImg).length==extractedItems.length){
                const endTime2 = Date.now();
                const responseTimeMs2 = endTime2 - startTime2;
                const responseTimeSeconds2 = (responseTimeMs2 / 1000).toFixed(2);
                console.log("Image Search Time in seconds:", responseTimeSeconds2, "seconds");
                // 토너먼트 대진표 생성
                tournament = createTournamentBracket(extractedItems);
                console.log("Tournament Bracket:", tournament); // 토너먼트 대진표 로깅
                
                res.json({ message: Object.values(tournamentImg) });  // 클라이언트에 원본 응답 전송. 어차피 안씀
                clearInterval(whileTime);
            }

        },50)
    } catch (error) {
        console.error('Error on API request:', error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ error: "결과를 가져오는데 실패했습니다.", details: error.message });
    }
    
});



function shuffleArray(array) {
for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
}
return array;
}

function createTournamentBracket(items) {
    shuffleArray(items); // 배열을 랜덤하게 섞음

    const pairs = [];
    for (let i = 0; i < items.length; i += 2) { 
        if (items[i + 1]) {
            pairs.push([`${items[i]}`, `${items[i + 1]}`]);
        } else {
            pairs.push([`${items[i]}`]);//추후에 내보내는 or 다음 선정일 때 한 개면 다음으로 넘어가짐으로 해야할 듯 -> 물론 어차피 짝수개로 보내기는 함;
        }
    }
    return pairs;
}


app.get('/choice', async (req, res) => {

    currentMatchGet=currentMatchPost;
    console.dir("현재 경기 수: "+currentMatchGet); 

    let mLi=tournament[currentMatchGet];
    console.dir("현재 토너먼트 상황: "+tournament);
    console.dir("전달할 데이터: "+mLi); 

    //console.dir(mLi[0])
    let iLi=[tournamentImg[mLi[0]],tournamentImg[mLi[1]]];



    res.json({ message: mLi,img:iLi,MatchNum:currentMatchGet+1,RoundNum:tournament.length*2, keyword: prompt, endChk: endChk }); //0520


});

const controller = new AbortController();
let endChk=0;
let finalChk=0;//0510 귀찮


let DeLi={}
async function apiGo(name){
    try {
        const startTime = Date.now();

        const abortSignal = controller.signal; // 2
        console.dir( `${prompt}의 ${name}에 대하여 간략하게 설명해주세요.`);
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: `${prompt}의 ${name}에 대하여 간략하게 설명해주세요. (최대 3줄 요약으로)` }
                ]
            },
            {
                headers: {
                    'Authorization': 'Bearer '+process.env.OPENAI_API_KEY,                    
                    'Content-Type': 'application/json'
                }
            },
            {
                signal: abortSignal //혹시 모를 중단 기능을 위해서 일단 넣어둠
            }
        )
        .catch( ( { message } ) => { // 5
            console.dir("GPT API 중간에 중단됨")
            console.log( message );
        } );


        const endTime = Date.now();  // 응답 완료 시간 기록
        const responseTimeMs = endTime - startTime;  // 전체 응답 시간 계산 (밀리초)
        const responseTimeSeconds = (responseTimeMs / 1000).toFixed(2);
        console.log("Total Response Time in seconds:", responseTimeSeconds, "seconds");  // 전체 응답 시간을 초 단위로 로깅


        // API 응답 구조를 로깅하여 확인
        console.log("API Response:", JSON.stringify(response.data, null, 2));

        // 응답에서 description 추출
        const description = response.data.choices[0].message.content.trim();
        DeLi[name]=description;
        console.dir(DeLi);
    } catch (error) {
        console.error('Error fetching description from GPT:', error);
        // res.status(500).json({ error: 'Failed to fetch description', details: error.message });
    }

}
app.post('/q', (req, res) => { //설명 불러오기 중단(api형태가 아니어도 됨)
    console.dir("!!!");
    controller.abort("응답시간이 너무 깁니다")

});


async function nextMatch(){
    if(tournament.length==2 && currentMatchPost+1==2){//준우승의 2번째가 끝났다면 -> 다음이 결승
        console.dir("잠깐, 다음이 결승이라구")
        console.dir(winItems)
        finalChk=1;
        
        //gpt api로 동시에 값을 전달 및 받을거면 이렇게, 따로따로면 apiGo 함수에서 두 번 돌려야함. 
        apiGo(winItems[0]);
        apiGo(winItems[1]);

    }
    if(tournament.length==1){//1등일 시


        console.log("1등!!");
        //결과 페이지로 전환
        endChk=1;
        return;


        

    }
    currentMatchPost++
    if(currentMatchPost>=tournament.length){
        console.dir("라운드 끝")
        tournament=createTournamentBracket(winItems);
        console.log("Tournament Bracket:", tournament); // 토너먼트 대진표 로깅
        currentMatchPost=0;


        winItems=[]
    }
}

let champion="우승자이름";
let championImg="https://cdn-icons-png.flaticon.com/512/5052/5052129.png";
app.post('/choice', async(req, res) => {
    const { keyword } = req.body; // 사용자가 선택한 키워드
    console.log('Received keyword:', keyword);
    winItems.push(keyword); // 승리 아이템 목록에 추가
    
    endChk = 0;
    nextMatch(); // 다음 매치로 이동
    console.dir(currentMatchPost);
    
    let mLi = tournament[currentMatchPost]; // 현재 매치 리스트
    let iLi = [tournamentImg[mLi[0]], tournamentImg[mLi[1]]]; // 현재 매치의 이미지 리스트

    if (endChk == 1) { // 토너먼트가 종료되었는지 확인
        console.dir("Tournament ended");
        mLi = keyword; // 최종 우승 키워드
        iLi = 'https://placehold.co/600x400'; // 우승 이미지

        await saveTournament(prompt, keyword, tournamentImg[keyword], g, g2); // 토너먼트 저장

        champion = keyword; // 챔피언 설정
        championImg = tournamentImg[keyword]; // 챔피언 이미지 설정

        // 승률 데이터 업데이트 로직
        for (const suggestedKeyword of extractedItems) {
            const isWinner = suggestedKeyword === keyword; // 현재 아이템이 우승자인지 확인
            await updateKeywordStats(prompt, suggestedKeyword, isWinner); // 승률 업데이트
        }
        
    }

    res.json({ message: mLi, img: iLi, MatchNum: currentMatchPost+1, RoundNum: tournament.length*2, keyword: prompt, endChk:endChk }); // 결과 반환
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);


});

//이미지
let google_api_key = process.env.GoogleSearch_API_KEY;// API KEY
let google_api_id = process.env.GoogleSearch_API_ID; // CSE ID

let whiteURL=['wiki']//앞에 순서대로 우선순위
let blackURL=['/blogthumb.']
let blackTitle={'노래':["악보"]}
async function triggersearch(query){ 
    try{
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${google_api_key}&cx=${google_api_id}&q="${query}" ${prompt} -facebook -tiktok -pann.nate -news.nate&searchType=image&num=10&filter=0`);//대상이 앞에, 키워드가 뒤에

        let SelectImg=0;

        
        const fetchedData = await response.json();
        let c=0;
        let is=fetchedData.items;
            is.forEach(function(item) {
                c=0;

                //URL 화이트리스트에 있는거 찾으면 종료
                whiteURL.forEach(function(t){
                    if(item.link.includes(t)){
                        SelectImg=item.link;
                        // console.dir(SelectImg);
                        c=1;
                        return;
                    }
                })
                if(c==1){
                    return true;
                }

                //URL 블랙리스트에 해당되면 다음으로 넘어감
                blackURL.forEach(function(t){
                    if(item.link.includes(t)){
                        // console.log(query+" 블랙url - "+item.link);
                        c=2;
                        return;
                    }
                })
                if(c==2){
                    return false;
                }

                //Title 블랙리스트에 해당되면 다음으로 넘어감
                for (const [key, value] of Object.entries(blackTitle)) {
                    if(item.htmlTitle.includes(key)){
                        // console.log(query+"블랙html - "+item.htmlTitle);
                        c=2;
                        return;
                    }
                }
                if(c==2){
                    return false;
                }//이거 연산 쓸데없이 많은 것 같으면 그냥 없애도됨. 나중에 필요할 수도?
                
                if(SelectImg==0){
                    SelectImg=item.link;
                    
                }//사실상 화이트리스트에 있는거 아니면 첫번째꺼

                
        })
        
        // console.log(query+" 선택된거 - "+SelectImg);
        return SelectImg;    



        }
    catch(error){
        console.error('Error on API request:', error.response ? JSON.stringify(error.response.data) : error.message);
        try{
            const res2 = await fetch(`https://www.googleapis.com/customsearch/v1?key=${google_api_key}&cx=${google_api_id}&q=${query} -facebook -tiktok -pann.nate -news.nate&searchType=image&num=1&filter=0`);
            const fetchedData2 = await res2.json();
            return fetchedData2.items[0].link;

        }
        catch(error){
            console.error('Error on API request2:', error.response ? JSON.stringify(error.response.data) : error.message);
            return "/images/noneimg.png"; //오류(받은 값이 없어도 해당됨)나면 noneimg출력 
        }


    }
}
app.post('/fetch-winner-description', async (req, res) => {
    const { winnerKeyword } = req.body;

    let hoxy=0;
    if(DeLi[winnerKeyword]){
        res.json({'description':DeLi[winnerKeyword]});
    }
    else{
        const interval = setInterval(() => {
            hoxy+=1;
            if(hoxy>10000){ //10000 * 0.25초 = 2500초
                res.json({'description':'불러오기 실패'}); //aborb 해줘서 gpt api를 멈춰줘도 됨
                clearInterval(interval);
            }
    
            if(DeLi[winnerKeyword]){
                res.json({'description':DeLi[winnerKeyword]});
                clearInterval(interval);
            }
        }, 250); //구질구질하게 체크
    }
});



app.get('/recommended', async (req, res) => {
    try {
      const keywords = await getRecentKeywords(); // 데이터베이스에서 키워드 가져오기
      res.json({ keywords });
    } catch (error) {
      console.error('Failed to fetch recommended keywords:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

//result페이지의 값 보내기
app.get('/resultData', async (req, res) => {
    //이거 if문으로 endChk가 1이어야 작동되게 하면 될 듯
    res.json({ champion: champion, championImg: championImg, RoundNum: extractedItems.length, keyword: prompt });

});


app.get('/tournaments', async (req, res) => {
    try {
        const tournaments = await db.getRecentTournaments(); // 데이터베이스에서 최근 토너먼트 가져오기
        res.json({ tournaments });
    } catch (error) {
        console.error('Failed to fetch recent tournaments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//수집한 승률 내보내기
app.get('/keyword-stats/:winnerKeyword', async (req, res) => {
    try {
        const stats = await a(decodeURIComponent(req.params.winnerKeyword),prompt);
        console.dir(stats);
        if (stats !== null) {
            res.json(stats);
        } else {
            res.status(500).json({ error: "Failed to get user total wins" });
        }
    } catch (error) {
        console.error("Failed to get user total wins", error);
        res.status(500).json({ error: "Failed to get user total wins", details: error.message });
    }
});

process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit();
}); //웹 끊길때 데이터베이스도 연결 해제

/* 고려 사항
248.. 등의 2의 배수가 아닌 다른 경우의 수를 받을 때 대비 필요
*/