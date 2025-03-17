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

## Technologies Used

- HTML5/CSS3
- JavaScript (ES6+)
- Plotly.js for charts
- Bootstrap 5 for UI
- Yahoo Finance API for stock data

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