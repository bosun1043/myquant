from flask import Flask, render_template, request, jsonify
import yfinance as yf
import pandas as pd
import plotly
import plotly.graph_objs as go
import json
from datetime import datetime, timedelta
import numpy as np

app = Flask(__name__)



def test_yfinance(symbol):
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period='1y')
        if hist.empty:
            print(f"No data available for {symbol}")
        else:
            print(f"Data fetched successfully for {symbol}")
            print(hist.head())
    except Exception as e:
        print(f"Failed to fetch data for {symbol}: {str(e)}")

# Replace 'AAPL' with any stock symbol you are interested in
test_yfinance('AAPL')



def create_candlestick_chart(df):
    try:
        # Add moving averages to the chart
        sma20 = df['Close'].rolling(window=20).mean()
        sma50 = df['Close'].rolling(window=50).mean()
        
        fig = go.Figure()
        
        # Add candlestick
        fig.add_trace(go.Candlestick(
            x=df.index,
            open=df['Open'],
            high=df['High'],
            low=df['Low'],
            close=df['Close'],
            name='OHLC'
        ))
        
        # Add moving average traces
        fig.add_trace(go.Scatter(
            x=df.index,
            y=sma20,
            line=dict(color='orange', width=2),
            name='20-day SMA'
        ))
        
        fig.add_trace(go.Scatter(
            x=df.index,
            y=sma50,
            line=dict(color='blue', width=2),
            name='50-day SMA'
        ))
        
        fig.update_layout(
            title='Stock Price Chart with Moving Averages',
            yaxis_title='Stock Price (USD)',
            xaxis_title='Date',
            template='plotly_dark',
            showlegend=True
        )
        
        return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    except Exception as e:
        raise ValueError(f"Error creating chart: {str(e)}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        symbol = request.form.get('symbol')
        if not symbol:
            return jsonify({
                'success': False,
                'error': 'Stock symbol is required'
            })
        
        df = get_stock_data(symbol)
        
        if len(df) < 2:
            return jsonify({
                'success': False,
                'error': 'Insufficient data for analysis'
            })
        
        # Calculate some basic metrics with safe indexing
        current_price = float(df['Close'].iloc[-1])
        price_change = current_price - float(df['Close'].iloc[-2])
        price_change_pct = (price_change / float(df['Close'].iloc[-2])) * 100
        
        # Create candlestick chart
        chart_json = create_candlestick_chart(df)
        
        # Calculate simple moving averages
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        
        # Basic statistics with safe type conversion
        stats = {
            'current_price': round(float(current_price), 2),
            'price_change': round(float(price_change), 2),
            'price_change_pct': round(float(price_change_pct), 2),
            'volume': int(df['Volume'].iloc[-1]),
            'high_52w': round(float(df['High'].max()), 2),
            'low_52w': round(float(df['Low'].min()), 2)
        }
        
        return jsonify({
            'success': True,
            'chart': chart_json,
            'stats': stats
        })
    
    except ValueError as ve:
        return jsonify({
            'success': False,
            'error': str(ve)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'An unexpected error occurred: {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 
