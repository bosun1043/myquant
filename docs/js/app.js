class StockAnalyzer {
    constructor() {
        this.form = document.getElementById('stockForm');
        this.results = document.getElementById('results');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        const symbol = document.getElementById('symbol').value.toUpperCase();
        
        this.showLoading();
        try {
            const data = await this.fetchStockData(symbol);
            if (!data) {
                throw new Error('No data received from API');
            }
            this.processAndDisplayData(data);
        } catch (error) {
            this.showError(error.message);
            console.error('Detailed error:', error);
        }
    }

    async fetchStockData(symbol) {
        const apiKey = 'cle8p89r01qjq9sl4q3gcle8p89r01qjq9sl4q40';
        const today = Math.floor(Date.now() / 1000);
        const oneYearAgo = today - 365 * 24 * 60 * 60;
        const resolution = 'D'; // Daily candles

        try {
            console.log('Fetching stock data...');
            
            // Fetch candle data
            const candleUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${oneYearAgo}&to=${today}&token=${apiKey}`;
            console.log('Fetching from:', candleUrl);
            
            const response = await fetch(candleUrl);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            
            if (data.s === 'no_data') {
                throw new Error('No data available for this symbol');
            }

            // Transform Finnhub data to match our expected format
            const transformedData = {
                chart: {
                    result: [{
                        timestamp: data.t,
                        indicators: {
                            quote: [{
                                open: data.o,
                                high: data.h,
                                low: data.l,
                                close: data.c,
                                volume: data.v
                            }]
                        }
                    }]
                }
            };
            
            return transformedData;
        } catch (error) {
            console.error('Detailed fetch error:', error);
            throw new Error(`Failed to fetch stock data: ${error.message}`);
        }
    }

    processAndDisplayData(data) {
        const quotes = data.chart.result[0];
        const prices = quotes.indicators.quote[0];
        
        // Create time series data
        const timeData = quotes.timestamp.map(t => new Date(t * 1000));
        const ohlc = timeData.map((time, i) => ({
            time,
            open: prices.open[i],
            high: prices.high[i],
            low: prices.low[i],
            close: prices.close[i],
            volume: prices.volume[i]
        })).filter(item => item.open && item.high && item.low && item.close);

        // Calculate statistics
        const currentPrice = ohlc[ohlc.length - 1].close;
        const previousPrice = ohlc[ohlc.length - 2].close;
        const priceChange = currentPrice - previousPrice;
        const priceChangePct = (priceChange / previousPrice) * 100;

        // Create chart
        this.createChart(ohlc);

        // Update statistics
        document.getElementById('currentPrice').textContent = `$${currentPrice.toFixed(2)}`;
        document.getElementById('priceChange').textContent = 
            `$${priceChange.toFixed(2)} (${priceChangePct.toFixed(2)}%)`;
        document.getElementById('priceChange').style.color = 
            priceChange >= 0 ? '#4caf50' : '#f44336';
        document.getElementById('volume').textContent = 
            ohlc[ohlc.length - 1].volume.toLocaleString();
        document.getElementById('high52w').textContent = 
            `$${Math.max(...ohlc.map(d => d.high)).toFixed(2)}`;
        document.getElementById('low52w').textContent = 
            `$${Math.min(...ohlc.map(d => d.low)).toFixed(2)}`;

        this.hideLoading();
        this.results.style.display = 'block';
    }

    createChart(ohlc) {
        const trace = {
            x: ohlc.map(d => d.time),
            open: ohlc.map(d => d.open),
            high: ohlc.map(d => d.high),
            low: ohlc.map(d => d.low),
            close: ohlc.map(d => d.close),
            type: 'candlestick',
            name: 'OHLC'
        };

        // Calculate moving averages
        const sma20 = this.calculateSMA(ohlc.map(d => d.close), 20);
        const sma50 = this.calculateSMA(ohlc.map(d => d.close), 50);

        const layout = {
            title: 'Stock Price Chart with Moving Averages',
            yaxis: { title: 'Stock Price (USD)' },
            xaxis: { title: 'Date' },
            template: 'plotly_dark',
            showlegend: true
        };

        const data = [
            trace,
            {
                x: ohlc.map(d => d.time),
                y: sma20,
                type: 'scatter',
                line: { color: 'orange', width: 2 },
                name: '20-day SMA'
            },
            {
                x: ohlc.map(d => d.time),
                y: sma50,
                type: 'scatter',
                line: { color: 'blue', width: 2 },
                name: '50-day SMA'
            }
        ];

        Plotly.newPlot('stockChart', data, layout);
    }

    calculateSMA(data, window) {
        const sma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < window - 1) {
                sma.push(null);
                continue;
            }
            const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / window);
        }
        return sma;
    }

    showLoading() {
        this.results.style.display = 'none';
        this.error.style.display = 'none';
        this.loading.style.display = 'block';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        this.results.style.display = 'none';
        this.error.textContent = `Error: ${message}`;
        this.error.style.display = 'block';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new StockAnalyzer();
}); 