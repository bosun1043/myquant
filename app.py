from flask import Flask, render_template, jsonify, request, send_from_directory
import httpx
import os
from dotenv import load_dotenv
import traceback
import time
from src.analyze_data import load_all_csv_data, analyze_data
import pandas as pd
from src.claude_api import ClaudeAPI

# Force reload environment variables
load_dotenv(override=True)

app = Flask(__name__)
API_KEY = os.getenv('ANTHROPIC_API_KEY')
API_URL = "https://api.anthropic.com/v1/messages"
claude = ClaudeAPI()

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

@app.route('/api/overview/<visualization_type>')
def get_overview_data(visualization_type):
    try:
        df = pd.read_csv('data/total_region.csv')
        
        if visualization_type == 'regional':
            # Filter and process data for regional visualization
            regional_data = df[df['구분'].str.contains('시|도|군')].copy()
            return jsonify(regional_data.to_dict('records'))
        elif visualization_type == 'school_type':
            # Filter and process data for school type visualization
            school_types = ['초등학교', '중학교', '고등학교', '특수학교']
            school_data = df[df['구분'].isin(school_types)].copy()
            return jsonify(school_data.to_dict('records'))
        else:
            return jsonify({'error': 'Invalid visualization type'}), 400
            
    except Exception as e:
        print(f"Error in get_overview_data: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    max_retries = 3
    retry_delay = 1  # seconds
    
    try:
        data = request.json
        user_message = data.get('message')
        
        print(f"Received message: {user_message}")  # Debug print
        
        # Format the prompt to get the desired response format
        prompt = f"""You will be given a question about data. Your task is to analyze the question and present a concise summary.

Here is the question:
<question>
{user_message}
</question>

To complete this task, follow these steps:

1. Carefully read and analyze the provided question.
2. Focus on the aspects that should be addressed in the response.
3. Identify key points that answer the question.
4. Synthesize your findings into a concise summary.

You MUST format your response EXACTLY as follows:

## 주요 포인트
- Point 1: [First key point]
- Point 2: [Second key point]
- Point 3: [Third key point]

## 데이터의 의미
[Exactly 60 words or less about the implications of this data. Include a note that this interpretation is not absolute and may not be totally accurate.]

Important reminders:
- Base your response solely on the provided question.
- Ensure your response directly addresses the user's question.
- Be objective in your analysis and avoid personal opinions or speculations.
- If the question cannot be fully answered, state this clearly in your response.
- You MUST follow the exact format specified above with the two sections and bullet points
- Do not add any additional sections or content beyond what is specified"""

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
                    "content": prompt
                }
            ]
        }
        
        for attempt in range(max_retries):
            try:
                with httpx.Client(timeout=30.0) as client:
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
                raise
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Get data from the request
        data = request.json.get('data')
        summary_request = request.json.get('summary_request')
        
        # Generate analysis using Claude
        analysis = claude.generate_response(data, summary_request)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    except Exception as e:
        print(f"Error in analyze: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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