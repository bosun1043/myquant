<<<<<<< HEAD
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

- Dayoung Lee

## 라이선스 (License)

MIT License 
=======
# Stock Analysis Platform

A web-based platform for stock analysis and visualization, featuring interactive candlestick charts and technical indicators. This project uses the Yahoo Finance API to fetch real-time stock data and Plotly.js for visualization.

## Features

- Real-time stock data from Yahoo Finance
- Interactive candlestick charts
- Technical indicators (20-day and 50-day SMAs)
- Key statistics display
- Responsive, modern dark theme UI
- Mobile-friendly design

## Live Demo

Visit the live demo at: https://bosun1043.github.io/myquant


## Local Development

1. Clone the repository:
```bash
git clone https://github.com/bosun1043/myquant.git
cd myquant
```

2. Open the project in a web server. You can use Python's built-in server:
```bash
python -m http.server
```

3. Visit `http://localhost:8000/docs/` in your browser

## Deployment to GitHub Pages

1. Fork this repository
2. Go to your fork's Settings > Pages
3. Set the source to the `main` branch and the folder to `/docs`
4. Your site will be published at `https://YOUR_USERNAME.github.io/myquant`

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Yahoo Finance API](https://finance.yahoo.com/) for providing stock data
- [Plotly.js](https://plotly.com/javascript/) for the charting library
- [Bootstrap](https://getbootstrap.com/) for the UI framework 
>>>>>>> origin/main
