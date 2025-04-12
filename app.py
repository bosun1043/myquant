from flask import Flask, render_template, jsonify, request, send_from_directory
import httpx
import os
from dotenv import load_dotenv
import traceback
import time
from src.analyze_data import load_all_csv_data, analyze_data
import pandas as pd

load_dotenv()

app = Flask(__name__)
API_KEY = os.getenv('ANTHROPIC_API_KEY')
API_URL = "https://api.anthropic.com/v1/messages"

# Debug print to check if API key is loaded
print(f"API Key loaded: {'Yes' if API_KEY else 'No'}")
print(f"API Key length: {len(API_KEY) if API_KEY else 0}")
print(f"API Key first 5 chars: {API_KEY[:5] if API_KEY else 'None'}")

@app.route('/')
def index():
    return render_template('index.html')

# 데이터 파일 제공을 위한 라우트
@app.route('/data/<path:filename>')
def serve_data(filename):
    return send_from_directory('data', filename)

@app.route('/chat', methods=['POST'])
def chat():
    max_retries = 3
    retry_delay = 1  # seconds
    
    # Check if API key is available
    if not API_KEY or API_KEY == 'your_api_key_here':
        return jsonify({
            'status': 'error',
            'message': 'API key is not configured. Please update the .env file with your Anthropic API key.'
        }), 500
    
    for attempt in range(max_retries):
        try:
            data = request.json
            user_message = data.get('message')
            
            print(f"Received message: {user_message}")  # Debug print
            
            headers = {
                "x-api-key": API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            
            payload = {
                "model": "claude-3-opus-20240229",
                "max_tokens": 1024,
                "messages": [
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            }
            
            with httpx.Client(timeout=30.0) as client:  # Increased timeout to 30 seconds
                response = client.post(API_URL, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
            
            print(f"API Response: {result}")  # Debug print
            
            return jsonify({
                'status': 'success',
                'response': result['content'][0]['text']
            })
        except httpx.ReadTimeout:
            if attempt < max_retries - 1:
                print(f"Timeout occurred, retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
                continue
            else:
                print("Max retries reached")
                return jsonify({
                    'status': 'error',
                    'message': 'Request timed out after multiple retries'
                }), 500
        except Exception as e:
            print(f"Error: {str(e)}")  # Debug print
            print(traceback.format_exc())  # Print full traceback
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Get the analysis request from the form
        summary_request = request.form.get('summary_request', '')
        
        # Load and analyze the data
        df = load_all_csv_data()
        data_str = df.to_string()
        
        # Get the analysis
        response = analyze_data(data_str, summary_request)
        
        if response:
            return jsonify({
                'success': True,
                'analysis': response
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate analysis'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/data')
def get_data():
    try:
        # Read the data
        df = pd.read_csv('data/total_region_original.csv')
        
        # School types for filtering
        school_types = ['초등학교', '중학교', '일반고', '특성화고', '자율고', '특수목적고', '특수학교']
        
        # Filter data based on visualization type
        visualization = request.args.get('visualization', '')
        if visualization == 'school_type':
            # For school type visualization, only include school type data
            filtered_df = df[df['구분'].isin(school_types)]
        elif visualization == 'regional':
            # For regional visualization, exclude school types
            filtered_df = df[~df['구분'].isin(school_types)]
        else:
            # For other visualizations, use all data
            filtered_df = df
            
        # Convert to dictionary
        data = filtered_df.to_dict('records')
        return jsonify(data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5004)