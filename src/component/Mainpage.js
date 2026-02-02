import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import '../App.css';
import logo from '../images/로고.png';
import logo2 from '../images/메인1.png';

const Mainpage = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [randomMessage, setRandomMessage] = useState('');
  const [recommendedKeywords, setRecommendedKeywords] = useState([]);
  const [showModal, setShowModal] = useState(false); // 모달 창 표시 여부 상태 추가
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [GameNumber, setGameNumber] = useState('');
  const navigate = useNavigate();

  const handleKeywordChanged = (e) => {
    const inputValue = e.target.value;
    const containsSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(inputValue);
    if (!containsSpecialChars) {
      setKeyword(inputValue);
    }
    else {
      alert("특수문자는 사용할 수 없습니다.");
    }
  };

  const messages = [
    '잠시만 기다려주세요...⏳',
    '해당 작업을 처리하는 동안 신비한 숲을 횡단하는 중...⏳',
    '월드컵을 생성하는 중입니다...⏳',
    '이미지를 로딩하는 동안 별들을 세는 중...⏳',
    '월드컵을 생성하는 동안 우주 여행을 준비 중...⏳',
    '키워드를 처리하는 동안 비행기가 날고 있어요...⏳',
    '로딩 중에는 시간 여행을 하는 것 같아요...⏳',
    '컴퓨터가 생각하는 동안 노래를 부르는 중...⏳',
    '데이터를 처리하는 동안 머릿속에서 불꽃놀이를 즐기는 중...⏳',
    '로딩 중에는 바다를 건너는 보트에 타고 있어요...⏳',
    '월드컵을 생성하는 동안 우주선을 타고 우주를 탐험 중...⏳',
    '로딩 중에는 마법사가 주문을 외우는 중...⏳',
    '로딩 중에는 블랙홀을 탈출하는 우주 비행을 준비 중...⏳',
  ];

  useEffect(() => {
    if (loading) {
      const initialRandomIndex = Math.floor(Math.random() * messages.length);
      setRandomMessage(messages[initialRandomIndex]);

      const intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * messages.length);
        const textElement = document.getElementById('loadingmessage');
        if (textElement) {
          textElement.style.opacity = 0;
          setTimeout(() => {
            textElement.innerText = messages[randomIndex];
            textElement.style.opacity = 1;
          }, 500);
        }
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [loading, messages]);

  //0517
  async function preload(li) {
    for(let i = 0; i < li.length; i++) {
      document.getElementById('preImg').innerHTML=`<img id="hiddenImg" src="${li[i]}" border=1px style="opacity: 0; width: 0; height: 0;"></img>`
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gender) {
      alert('성별을 선택하세요.');
      return;
    }
    if (!ageGroup) {
      alert('연령대를 선택하세요.');
      return;
    }
    if (!GameNumber) {
      alert('경기수를 선택하세요.');
      return;
    }

    setLoading(true);
    // 생성 버튼 클릭 후 모달 닫기
    toggleModal();
    try {
      const response = await fetch(window.location.protocol+'//'+window.location.hostname+':3001/setkeyword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, gender, ageGroup,GameNumber }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data.message);
        await preload(data.message)
        navigate("/subpage");
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRecommendedKeywords = async () => {
      try {
        const response = await fetch(window.location.protocol+'//'+window.location.hostname+':3001/recommended');
        if (response.ok) {
          const data = await response.json();
          setRecommendedKeywords(data.keywords);
        } else {
          console.error('Error fetching recommended keywords:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching recommended keywords:', error);
      }
    };

    fetchRecommendedKeywords();
  }, []);

  const handleRecommendedKeywordClick = (clickedKeyword) => {
    setKeyword(clickedKeyword);
  };

  // 모달 창 열기/닫기 함수
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const Keyword = () =>{ //0520. 그리고 handleSubmit에서 제거
    if (keyword.trim() === '') {
      alert('키워드를 입력하세요.');
      return;
    }
    toggleModal()
  }

  

  return (<>
    <div className="container">
      <div className="banner">
        <div className="logoContainer">
          <Link to="/">
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        </div>
      </div>
      <div className="contentContainer">
        <div className="imageContainer">
          <img src={logo2} alt="Logo" className="logo" />
        </div>
        <div className="inputContainer">
          <span className="guideMark">❔</span>
          <div className='jb-text'>
            <p id='text-title'>가이드라인</p>
            <p id='guide-text'>※원하시는 주제의 단어에 대해서 간략하게 서술해주시면 더욱 정확한 값을 불러올수 있습니다. ex)pc게임,한식,2000년대 한국 노래,2010년대 한국 여자아이돌 그룹 <br></br><br></br>※단어는 한국어로만 입력해주시고,특수문자는 입력이 금지 되어있으며, 주제와 맞지않는 키워드처럼 결과에 문제가 될 수 있는 문장들은 월드컵 생성 결과에 영향을 줄 수 있습니다.<br></br><br></br>※구글정책에 의하여 불건전한 단어 혹은 명확하지 않은 주제 선정은 월드컵이 생성되지 않을 수 있습니다.<br></br><br></br>※추상적인 주제의 경우 이미지나 키워드가 정확한 값이 나오지 않을수 있습니다.</p>
          </div>
          <input
            type="text"
            placeholder="월드컵을 진행할 키워드를 입력하세요"
            className="inputField"
            value={keyword}
            onChange={handleKeywordChanged}
          />
          {!loading && (
            <button id='create-btn' type="button" onClick={Keyword}>
              월드컵 생성
            </button>
          )}
          {loading && (<p id='loadingmessage' className={`loadingMessage ${randomMessage ? '' : 'hidden'}`}>{randomMessage}</p>)}
        </div>
      </div>
      <div className="recommendedKeywords">
        <h2 id='randomkeyword2'>추천된 키워드</h2>
        <ul id='randomkeyword'>
          {recommendedKeywords.map((keyword, index) => (
            <li key={index} onClick={() => handleRecommendedKeywordClick(keyword)}>
              {keyword}
            </li>
          ))}
        </ul>
      </div>
            {showModal && (
        <div className="modal">
          <div className="modalContent">
            <span className="closeButton3" onClick={toggleModal}>×</span>
            <h2>성별과 연령 선택</h2>
            <select className='selectinfo' value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">성별 선택</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
            </select>
            <select className='selectinfo' value={ageGroup} onChange={e => setAgeGroup(e.target.value)}>
              <option value="">연령대 선택</option>
              <option value="10대">10대</option>
              <option value="20대">20대</option>
              <option value="30대">30대</option>
              <option value="40대">40대</option>
              <option value="50대">50대 이상</option>
            </select>
            <select className='selectinfo' value={GameNumber} onChange={e => setGameNumber(e.target.value)}>
              <option value="">경기수 선택</option>
              <option value="8">8강</option>
              <option value="16">16강</option>
              <option value="32">32강</option>
            </select>
            <button className="modalButton" onClick={handleSubmit}>생성하기</button>
          </div>
        </div>
      )}
    </div>
    <div id="preImg"></div>
    </>
  );
};

export default Mainpage;
