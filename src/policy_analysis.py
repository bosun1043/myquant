import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import os

def create_policy_analysis():
    # 디렉토리 생성
    os.makedirs('static/data/policy', exist_ok=True)
    
    # 가상의 데이터 생성
    np.random.seed(42)
    n_schools = 100
    n_regions = 5
    
    # 지역별 HDI (Human Development Index) 생성
    region_hdi = np.random.normal(0.7, 0.1, n_regions).clip(0.5, 0.9)
    
    # 지역 이름 설정
    region_names = ['수도권', '영남권', '호남권', '충청권', '강원권']
    
    # 지역별 HDI 데이터프레임 생성
    hdi_df = pd.DataFrame({
        '지역': region_names,
        'HDI': region_hdi
    })
    
    # HDI 시각화 (Plotly)
    fig_hdi = go.Figure()
    fig_hdi.add_trace(go.Bar(
        x=hdi_df['지역'],
        y=hdi_df['HDI'],
        marker_color='rgb(55, 83, 109)'
    ))
    fig_hdi.update_layout(
        title='지역별 HDI 분포',
        xaxis_title='지역',
        yaxis_title='HDI',
        yaxis_range=[0.5, 1.0],
        template='plotly_white',
        font=dict(family="Arial, sans-serif", size=12),
        width=800,
        height=500
    )
    
    # HTML 파일로 저장
    with open('static/data/policy/regional_hdi.html', 'w', encoding='utf-8') as f:
        f.write(fig_hdi.to_html(full_html=False, include_plotlyjs=False))
    
    # 학교별 데이터 생성
    data = []
    for region_id in range(n_regions):
        n_schools_region = n_schools // n_regions
        
        # 디지털 접근성 점수 (0-100)
        digital_access = np.random.normal(60 + region_hdi[region_id] * 20, 10, n_schools_region).clip(0, 100)
        
        # HDI에 따른 기본 성취도
        base_achievement = 50 + region_hdi[region_id] * 30
        
        # 디지털 접근성과 HDI의 상호작용을 고려한 성취도 계산
        for school_id in range(n_schools_region):
            achievement = (base_achievement + 
                         0.2 * digital_access[school_id] +  # β1 효과
                         10 * region_hdi[region_id] +       # β2 효과
                         0.1 * digital_access[school_id] * region_hdi[region_id] +  # β3 상호작용 효과
                         np.random.normal(0, 5))  # 오차항
            
            data.append({
                'region_id': region_id,
                'region_name': region_names[region_id],
                'school_id': school_id,
                'digital_access': digital_access[school_id],
                'hdi': region_hdi[region_id],
                'achievement': achievement
            })
    
    df = pd.DataFrame(data)
    
    # HLM 모델 시각화 (Plotly)
    fig_hlm = go.Figure()
    
    # 지역별로 다른 색상의 산점도와 회귀선 추가
    colors = px.colors.qualitative.Set3[:n_regions]
    
    for region_id, region_name in enumerate(region_names):
        region_data = df[df['region_id'] == region_id]
        
        # 산점도
        fig_hlm.add_trace(go.Scatter(
            x=region_data['digital_access'],
            y=region_data['achievement'],
            mode='markers',
            name=region_name,
            marker=dict(color=colors[region_id]),
            legendgroup=region_name,
            showlegend=True
        ))
        
        # 회귀선
        z = np.polyfit(region_data['digital_access'], region_data['achievement'], 1)
        p = np.poly1d(z)
        x = np.linspace(region_data['digital_access'].min(), region_data['digital_access'].max(), 100)
        
        fig_hlm.add_trace(go.Scatter(
            x=x,
            y=p(x),
            mode='lines',
            name=f'{region_name} 추세선',
            line=dict(color=colors[region_id], dash='dash'),
            legendgroup=region_name,
            showlegend=False
        ))
    
    fig_hlm.update_layout(
        title='디지털 접근성과 학업 성취도의 관계: 지역별 HDI 효과',
        xaxis_title='디지털 접근성 지수',
        yaxis_title='학업 성취도',
        template='plotly_white',
        legend_title='지역',
        hovermode='closest',
        font=dict(family="Arial, sans-serif", size=12),
        width=800,
        height=600
    )
    
    # LaTeX 수식 추가
    fig_hlm.add_annotation(
        text=r'$Y_{ij} = \beta_0 + \beta_1 \cdot \text{DigitalAccess}_{ij} + \beta_2 \cdot \text{HDI}_j + \beta_3 \cdot (\text{DigitalAccess}_{ij} \times \text{HDI}_j) + u_j + \epsilon_{ij}$',
        xref='paper',
        yref='paper',
        x=0.5,
        y=-0.15,
        showarrow=False,
        font=dict(size=12)
    )
    
    # HTML 파일로 저장
    with open('static/data/policy/policy_impact.html', 'w', encoding='utf-8') as f:
        f.write(fig_hlm.to_html(full_html=False, include_plotlyjs=False))
    
    # 분석 결과
    results = {
        'model_summary': {
            'total_schools': len(df),
            'regions': n_regions,
            'avg_achievement': df['achievement'].mean(),
            'avg_digital_access': df['digital_access'].mean(),
            'correlation': df['digital_access'].corr(df['achievement'])
        },
        'regional_effects': {
            region_names[i]: {
                'hdi': region_hdi[i],
                'avg_achievement': df[df['region_id'] == i]['achievement'].mean(),
                'digital_effect': np.polyfit(
                    df[df['region_id'] == i]['digital_access'],
                    df[df['region_id'] == i]['achievement'],
                    1
                )[0]
            }
            for i in range(n_regions)
        },
        'regional_hdi': hdi_df.to_dict('records'),
        'schools': df.to_dict('records')
    }
    
    return results 