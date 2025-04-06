from flask import Flask, render_template, jsonify, request
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
claude = anthropic.Client(api_key=os.getenv('ANTHROPIC_API_KEY'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        
        # Claude API 호출
        message = claude.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": user_message
            }]
        )
        
        return jsonify({
            'status': 'success',
            'response': message.content[0].text
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 