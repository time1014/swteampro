import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from '../images/로고.png';
import '../App.css';
import { PieChart, Pie, Legend, Tooltip, Cell, LabelList } from 'recharts';  // Import Cell and LabelList  


const Result = () => {
    const [champion, setChampion] = useState('우승키워드');
    const [championImg, setChampionImg] = useState('이미지주소');
    const [championDescription, setChampionDescription] = useState('');
    const [stats, setStats] = useState({ wins: 0, total: 0, winRate: 0 });
    const [error, setError] = useState('');
    const [dots, setDots] = useState('');
    const [tournaments, setTournaments] = useState([]);
    const [championPercentage, setChampionPercentage] = useState(0);

    const currentValue = parseFloat((stats.winRate * 100).toFixed(1));

    useEffect(() => {
        async function fetchTournaments() {
            try {
                const response = await axios.get(window.location.protocol+'//'+window.location.hostname+':3001/tournaments');
                const tournamentData = response.data.tournaments;
                setTournaments(tournamentData);

                // 최근 값 가져오기
                const recentValue = tournamentData[tournamentData.length - 1]; // 가장 최근 값이라고 가정

                // 최근 값과 동일한 값의 수를 세기
                const count = tournamentData.filter(value => value === recentValue).length;

                // 전체 값의 수
                const totalCount = tournamentData.length;

                // 퍼센트 계산
                const percentage = (count / totalCount) * 100;

                // 퍼센트 값을 championPercentage 상태로 설정
                setChampionPercentage(percentage.toFixed(2)); // 소수점 두 자리까지 표시
            } catch (error) {
                console.error('Failed to fetch tournaments:', error);
                setError('Failed to fetch tournaments');
            }
        }

        fetchTournaments();
    }, []);


        const fetchChampionDescription = async (winnerKeyword) => {
            try {
                const response = await fetch(window.location.protocol+'//'+window.location.hostname+':3001/fetch-winner-description', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ winnerKeyword })
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch description');
                }
                const data = await response.json();
                setChampionDescription(data.description);
            } catch (error) {
                setError('Failed to fetch champion description');
            }
        };



    const initResultData = async () => {
        try {
            const response = await fetch(window.location.protocol+'//'+window.location.hostname+':3001/resultData');
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setChampion(data.champion);
                setChampionImg(data.championImg);
                fetchChampionDescription(data.champion);
                fetchStats(data.champion);
            } else {
                console.error('Failed to fetch initial data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchStats = async (winnerKeyword) => {
        try {
            const response = await fetch(`${window.location.protocol+'//'+window.location.hostname}:3001/keyword-stats/${encodeURIComponent(winnerKeyword)}`);
            if (response.ok) {
                const data = await response.json();
                console.dir(data[0])
                setStats({ wins: data[0].wins, total: data[0].total, winRate: data[2]/data[1] });
            } else {
                throw new Error('Failed to fetch keyword stats');
            }
        } catch (error) {
            setError('Failed to fetch stats: ' + error.message);
        }
    };

    useEffect(() => {
        initResultData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prevDots => prevDots.length === 3 ? '' : prevDots + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);



    return (
        <div className="resultContainer2">
            <div className="banner">
                <div className="logoContainer">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="logo" />
                    </Link>
                </div>
            </div>
            <div className="resultContentContainer">
                <div className="winningContainer">
                    <div>
                        <div className="winningText">
                            <span role="img" aria-label="trophy">🏆</span>  우승: {champion}
                        </div>
                    </div>
                </div>
            </div>
            <div className="resultImageContainer">
                <img src={championImg} alt="Image Placeholder" className="resultImagePlaceholder" />
            </div>
            <div className='resultbtns'>
                <Link to="/">
                    <button className="largeButton">다시하기</button>
                </Link>

            </div>
            <div className='plusinformation'>
                {championDescription ? (
                    championDescription
                ) : (
                    <span>우승 키워드의 설명이 로딩 중입니다{dots}</span>
                )}
            </div>

            <div className="statisticsContent" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
    <div id="qq" style={{ margin: '0 auto', display: 'flex' }}>
        <div style={{ marginRight: '20px' }}>
        <h3 className="largerFont"style={{ marginBottom: '20px' }}>승률: {currentValue}%</h3>
            <PieChart width={240} height={200}>
                <Pie
                    data={[{ value: currentValue }, { value: 100 - currentValue }]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    label={false} // 레이블 숨기기
                >
                    <LabelList dataKey="name" position="outside" />
                    <Cell fill="#EB6927" />
                    <Cell fill="#FFF2DA" />
                </Pie>
                <Tooltip />
            </PieChart>
        </div>
        <div>
        <h3 className="largerFont" style={{ marginBottom: '20px' }}>키워드 비율: {championPercentage}%</h3>
            <PieChart width={240} height={200} >
                <Pie
                    data={[{ value: parseFloat(championPercentage) }, { value: 100 - parseFloat(championPercentage) }]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    label={false} // 레이블 숨기기
                >
                    <LabelList dataKey="name" position="outside" />
                    <Cell fill="#EB6927" />
                    <Cell fill="#FFF2DA" />
                </Pie>
                <Tooltip />
            </PieChart>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;
