from flask import Flask, render_template, jsonify, request
import httpx
import os
from dotenv import load_dotenv
import traceback
import time

load_dotenv()

app = Flask(__name__)
API_KEY = os.getenv('ANTHROPIC_API_KEY')
API_URL = "https://api.anthropic.com/v1/messages"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    max_retries = 3
    retry_delay = 1  # seconds
    
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

if __name__ == '__main__':
    app.run(debug=True, port=5001) 