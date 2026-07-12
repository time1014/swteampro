# 🏆 AI 기반 이상형월드컵 자동생성 서비스

## 1. 프로젝트 개요
**"주제만 입력하면 나만의 이상형 월드컵이 뚝딱!"**

### 💡 프로젝트 추진 배경
* **AS-IS**: 기존에는 주제에 따른 키워드 선정부터 이미지 검색 및 선택까지의 과정에 상당한 시간이 소요되었습니다. 또한, 다른 사람에 의해 제작된 데이터가 충분히 쌓이지 않으면 원하는 월드컵을 진행하기 불가한 구조였습니다.
* **TO-BE**: **키워드 선정과 이미지 검색 및 선택을 자동화**합니다. 사용자가 원하는 '주제'만 입력하면 즉시 월드컵을 진행할 수 있도록 생성 과정을 획기적으로 단축하고 자동화했습니다.

### 🎯 활용 목적 및 타겟 오디언스
* **타겟 오디언스**: 트렌드에 민감한 MZ 세대
* **활용 목적**: 
  * 이상형 월드컵 생성의 자동화로 사용자에게 편리함 제공
  * 성별, 나이대별 선호도 데이터를 수집함으로 향후 마케팅 데이터로 활용 가능

---

## 2. 프로젝트 개발 환경 (Tech Stack)

### 🖥️ Frontend
* ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

### ⚙️ Backend
* ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

### 🗄️ Database
* ![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

### 🌐 API & Cloud
* **OpenAI (ChatGPT) API** : 사용자가 입력한 주제에 맞춘 후보군 키워드 자동 생성
* **Google Custom Search API** : 생성된 키워드를 기반으로 월드컵에 사용될 적합한 이미지 자동 검색 및 수집
* ![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white) : 프론트엔드, 백엔드 및 DB 호스팅

### 🛠 Collaboration Tools
* **Notion**, **GitHub**, **Jira**

---

## 3. 시스템 아키텍처
1. **User**가 Frontend 영역에 접속하여 월드컵 주제를 입력합니다.
2. Frontend에서 Backend로 월드컵 생성 API를 요청합니다.
3. Backend는 **OpenAPI (ChatGPT)**에 주제를 전달하여 후보 키워드들을 추출합니다.
4. 추출된 키워드를 바탕으로 **Google Custom Search API**를 호출하여 각 후보의 이미지를 수집합니다.
5. 수집된 최종 데이터(텍스트 및 이미지 링크)는 **MySQL** 데이터베이스에 저장됩니다.
6. Backend가 Frontend로 데이터를 응답하여 사용자가 이상형 월드컵을 플레이할 수 있게 됩니다.
*(전체 서비스는 AWS Cloud 상에서 운영됩니다.)*

---

## 4. 팀 조직도 및 역할 분담

| 이름 | 역할 | 담당 업무 |
| :---: | :---: | :--- |
| **방진영** (팀장) | 프론트엔드, 백엔드 | 프로젝트 총괄, 페이지 구현 |
| **한동관** | 프론트엔드 | 프론트엔드 개발, 페이지 디자인 |
| **김재찬** | 백엔드 | 백엔드 개발, API(GPT, Google Search) 연동 및 서버 구축, AWS 호스팅 |
| **유영재** | 백엔드 | 백엔드 개발, 서버 구축, 데이터베이스 생성 및 연동 |
