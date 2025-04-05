# 교육 데이터 분석 프로젝트 (Education Data Analysis Project)

이 프로젝트는 한국의 교육 데이터를 분석하고 시각화하는 웹 애플리케이션입니다.

## 기능 (Features)

- 디지털 학습 자원 현황 분석
  - 디지털 자원 활용도 추이
  - 지역별 노트북 보급 현황
- 상관관계 분석
  - 디지털 자원과 학교 운영률의 상관관계
- 정책 효과 분석

## 기술 스택 (Technology Stack)

- Python 3.8+
- Flask 3.0.2
- Pandas 2.2.1
- NumPy 1.24.4
- Matplotlib 3.8.3
- Seaborn 0.13.2

## 설치 방법 (Installation)

1. 저장소 클론
```bash
git clone https://github.com/bosun1043/myquant.git
cd education_analysis
```

2. 가상환경 생성 및 활성화
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
```

3. 의존성 설치
```bash
pip install -r requirements.txt
```

## 실행 방법 (Usage)

1. Flask 서버 실행
```bash
python app.py
```

2. 웹 브라우저에서 접속
```
http://localhost:5001
```

## 프로젝트 구조 (Project Structure)

```
education_analysis/
├── app.py                 # Flask 애플리케이션
├── requirements.txt       # 의존성 목록
├── README.md             # 프로젝트 문서
├── data/                 # 데이터 파일
├── src/                  # 소스 코드
│   ├── together.py           # 데이터 통합
│   ├── correlation_analysis.py   # 상관관계 분석
│   ├── digital_resources.py      # 디지털 자원 분석
│   └── region_laptop_visualization.py  # 노트북 현황 분석
├── static/              # 정적 파일 (이미지, CSS, JS)
└── templates/           # HTML 템플릿
```

## 작성자 (Author)

- Jessica Kang

## 라이선스 (License)

MIT License 