import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import logo from '../images/로고.png';
import '../App.css';
import confetti from 'canvas-confetti'; // canvas-confetti 라이브러리 임포트


function initData() {
  return 1;
}

const Subpage = () => {
  let dummy = initData();

  const [m1, setM1] = useState('x');
  const [m2, setM2] = useState('x');
  const [im1, setIm1] = useState('');
  const [im2, setIm2] = useState('');
  const [match, setMatch] = useState(1);
  const [round, setRound] = useState(32);
  const [keyword, setKeyword] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const initRender = async (e) => {
    const response = await fetch(window.location.protocol+'//'+window.location.hostname+':3001/choice');

    if (response.ok) {

      const fetchedData = await response.json();

      if (fetchedData.endChk === 1) {//0520
        navigate("/");

      }
      console.dir(fetchedData.message)
      setM1(fetchedData.message[0])
      setM2(fetchedData.message[1])
      setIm1(fetchedData.img[0])
      setIm2(fetchedData.img[1])
      setMatch(fetchedData.MatchNum)
      setRound(fetchedData.RoundNum)
      setKeyword(fetchedData.keyword)
      console.dir(fetchedData)
      console.dir("몇 번?")

    }
  }


  useEffect(() => { //두 번 불러와지는거 해결 https://funveloper.tistory.com/110 혹은 firstChk로 해결하든가(get2번 사소함)
    initRender();
  }, [dummy]); //이거 처음 초기화 한 번만 실행 되겠지? -> 여러번이면 []로 설정해도 될듯

  useEffect(() => {
    if (round === '준결승' || round === '결승' || round === 16 || round === 8 || round === 4 || round === 2) {
      setModalIsOpen(true);
    }
  }, [round]);

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const navigate = useNavigate();//이거 서버에서 페이지 넘겨주는 방법 찾을 때까지 임시. 혹은 그냥 이렇게 하던가

  const postChoice = async (e) => { //뒤로가기 경우도 고려했을 때 리스트는 일단 놨두기
    e.target.disabled = true;
    e.preventDefault();

    try {
      const response = await fetch(window.location.protocol+'//'+window.location.hostname+':3001/choice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: e.target.dataset.no }),
      });

      if (response.ok) {
        const data = await response.json();
        console.dir(data)
        if (data.endChk === 1) {
          navigate("/result");

        }


        setTimeout(() => {
          setM1(data.message[0]);
          setM2(data.message[1]);
          setIm1(data.img[0]);
          setIm2(data.img[1]);
          setMatch(data.MatchNum)
          setRound(data.RoundNum)
          setKeyword(data.keyword); /* 전체적인 업데이트 1초뒤로 설정*/
          e.target.disabled = false;

        }, 1000);

        // 이미지 확대
        const selectedItem = e.target.closest('.itemContent').querySelector('.itemImage');
        selectedItem.classList.add('enlarged');
        setTimeout(() => {
          selectedItem.classList.remove('enlarged');
        }, 1000);



        /* 마지막 라운드 버튼 폭죽 설정 */
        if (data.endChk === 1) {
          confetti({
            particleCount: 150,  //폭죽 수 설정
            spread: 100,
            origin: { x: 0.5, y: 0.5 }, // 화면 중앙으로 설정
          });

        }

      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  return (<>
    <div className="resultContainer">
      <div className="banner">
        <div className="logoContainer">
          <Link to="/">
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        </div>
      </div>
      <h1 id='worldcuptitle'>
        {`${keyword}`} 월드컵 {`${round === 4 ? '준결승' : round === 2 ? '결승' : `${round}강`}`} {`${match}`} / {`${round / 2}`}
      </h1>



      <div className="itemContainer">

        <div className="itemContent">
          <h3 id='itemtitle'>{`${m1}`}</h3>
          <img src={`${im1}`} alt="로고" className="itemImage"  />
          <button className="upload-btn" onClick={postChoice} data-no={`${m1}`}>선택</button>
        </div>
        <div className="vs">vs</div> {/* "vs" 텍스트 추가 */}
        <div className="verticalLine"></div> {/* 세로선 추가 */}
        <div className="itemContent">
          <h3 id='itemtitle'>{`${m2}`}</h3>
          <img src={`${im2}`} alt="로고" className="itemImage" />
          <button className="upload-btn" onClick={postChoice} data-no={`${m2}`}>선택</button>
        </div>
      </div>

    </div>
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className="content"
      overlayClassName="overlay"
      contentLabel="Example Modal"
    >
      {round === 4 ? (
        <p className="modalText">{`준결승이 시작됩니다`}</p>
      ) : round === 2 ? (
        <p className="modalText">{`결승이 시작됩니다`}</p>
      ) : (
        <p className="modalText">{`${round}강이 시작됩니다`}</p>
      )}
      <button className="closeButton" onClick={closeModal}>닫기</button>
    </Modal>
  </>
  );
};
export default Subpage;