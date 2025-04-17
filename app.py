from flask import Flask, render_template, request, jsonify
from src.policy_analysis import create_policy_analysis
from src.overview_analysis import create_overview_visualizations
import os
from dotenv import load_dotenv
import anthropic

# Force reload environment variables
load_dotenv(override=True)

app = Flask(__name__)

# Initialize Claude API
claude_api = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/overview')
def overview():
    return render_template('overview.html')

@app.route('/digital-resources')
def digital_resources():
    return render_template('digital_resources.html')

@app.route('/policy_analysis')
def policy_analysis():
    results = create_policy_analysis()
    
    # Generate data for policy impact plot
    policy_data = []
    for region in results['regional_effects']:
        region_schools = [school for school in results['schools'] 
                        if school['region_name'] == region]
        
        # Add scatter plot data
        policy_data.append({
            'digital_access': [school['digital_access'] for school in region_schools],
            'achievement': [school['achievement'] for school in region_schools],
            'region': region
        })
    
    return render_template('policy_analysis.html',
                         regional_hdi=results['regional_hdi'],
                         policy_data=policy_data,
                         model_summary=results['model_summary'],
                         regional_effects=results['regional_effects'])

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
            
        response = claude_api.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        
        return jsonify({'response': response.content[0].text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5006)