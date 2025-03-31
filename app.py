from flask import Flask, render_template, request, jsonify
import pandas as pd
import plotly
import plotly.graph_objs as go
import json
import numpy as np

app = Flask(__name__)

def load_education_data():
    try:
        df = pd.read_csv('docs/data/integrated_education_data.csv')
        return df
    except Exception as e:
        raise ValueError(f"Error loading education data: {str(e)}")

def create_overview_charts(df):
    # Region distribution chart
    region_data = df.groupby('region')['digital_score'].mean()
    region_chart = go.Figure(data=[go.Pie(
        labels=region_data.index,
        values=region_data.values,
        hole=0.4
    )])
    region_chart.update_layout(title='지역별 디지털 접근성 분포')
    
    # Achievement distribution chart
    achievement_chart = go.Figure(data=[go.Histogram(
        x=df['math_score'],
        nbinsx=10
    )])
    achievement_chart.update_layout(
        title='수학 성취도 분포',
        xaxis_title='성취도 점수',
        yaxis_title='학교 수'
    )
    
    return {
        'region_chart': json.dumps(region_chart, cls=plotly.utils.PlotlyJSONEncoder),
        'achievement_chart': json.dumps(achievement_chart, cls=plotly.utils.PlotlyJSONEncoder)
    }

def create_correlation_chart(df):
    fig = go.Figure(data=[go.Scatter(
        x=df['digital_score'],
        y=df['math_score'],
        mode='markers'
    )])
    fig.update_layout(
        title='디지털 접근성과 수학 성취도 상관관계',
        xaxis_title='디지털 접근성 지수',
        yaxis_title='수학 성취도'
    )
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def create_policy_effect_chart(df):
    policy_data = df.groupby(['year', 'policy_status'])['math_score'].mean().unstack()
    
    fig = go.Figure()
    for status in policy_data.columns:
        fig.add_trace(go.Scatter(
            x=policy_data.index,
            y=policy_data[status],
            name=f'정책 시행 {status}',
            mode='lines+markers'
        ))
    
    fig.update_layout(
        title='정책 시행 전후 수학 성취도 비교',
        xaxis_title='연도',
        yaxis_title='평균 성취도'
    )
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/overview')
def overview():
    try:
        df = load_education_data()
        charts = create_overview_charts(df)
        
        stats = {
            'total_schools': len(df),
            'total_students': df['total_students'].sum(),
            'avg_digital_score': round(df['digital_score'].mean(), 2),
            'avg_math_score': round(df['math_score'].mean(), 2)
        }
        
        return jsonify({
            'success': True,
            'charts': charts,
            'stats': stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/correlation')
def correlation():
    try:
        df = load_education_data()
        chart = create_correlation_chart(df)
        
        # Calculate correlation coefficient
        correlation = round(df['digital_score'].corr(df['math_score']), 3)
        
        return jsonify({
            'success': True,
            'chart': chart,
            'correlation': correlation
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/policy')
def policy():
    try:
        df = load_education_data()
        chart = create_policy_effect_chart(df)
        
        # Calculate policy effect
        policy_effect = round(
            df[df['policy_status'] == 'after']['math_score'].mean() -
            df[df['policy_status'] == 'before']['math_score'].mean(),
            2
        )
        
        return jsonify({
            'success': True,
            'chart': chart,
            'policy_effect': policy_effect
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
