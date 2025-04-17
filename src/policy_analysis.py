import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import os

# 한글 폰트 설정
plt.rcParams['font.family'] = 'AppleGothic'
plt.rcParams['axes.unicode_minus'] = False

def create_policy_analysis():
    # 디렉토리 생성
    os.makedirs('static/data/policy', exist_ok=True)
    
    # 가상의 데이터 생성
    np.random.seed(42)
    n_schools = 100
    n_regions = 5
    
    # 지역별 HDI (Human Development Index) 생성
    region_hdi = np.random.normal(0.7, 0.1, n_regions).clip(0.5, 0.9)
    
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
                'school_id': school_id,
                'digital_access': digital_access[school_id],
                'hdi': region_hdi[region_id],
                'achievement': achievement
            })
    
    df = pd.DataFrame(data)
    
    # HLM 모델 시각화
    plt.figure(figsize=(12, 8))
    
    # 지역별로 다른 색상 사용
    colors = plt.cm.viridis(np.linspace(0, 1, n_regions))
    
    # 산점도와 회귀선
    for region_id in range(n_regions):
        region_data = df[df['region_id'] == region_id]
        
        # 산점도
        plt.scatter(region_data['digital_access'], region_data['achievement'],
                   c=[colors[region_id]], alpha=0.6, label=f'지역 {region_id+1}')
        
        # 회귀선
        z = np.polyfit(region_data['digital_access'], region_data['achievement'], 1)
        p = np.poly1d(z)
        x = np.linspace(region_data['digital_access'].min(), region_data['digital_access'].max(), 100)
        plt.plot(x, p(x), c=colors[region_id], alpha=0.8)
    
    plt.title('디지털 접근성과 학업 성취도의 관계: 지역별 HDI 효과', fontsize=14, pad=20)
    plt.xlabel('디지털 접근성 지수', fontsize=12)
    plt.ylabel('학업 성취도', fontsize=12)
    
    # 수식 추가
    equation = r"$Y_{ij} = \beta_0 + \beta_1 \cdot \mathrm{DigitalAccess}_{ij} + \beta_2 \cdot \mathrm{HDI}_j + " + \
              r"\beta_3 \cdot (\mathrm{DigitalAccess}_{ij} \times \mathrm{HDI}_j) + u_j + \epsilon_{ij}$"
    plt.figtext(0.5, 0.02, equation, ha='center', fontsize=12)
    
    # 범례 및 여백 조정
    plt.legend(title='지역 구분', bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.subplots_adjust(right=0.85, bottom=0.15)
    
    # 격자 추가
    plt.grid(True, alpha=0.3)
    
    # 그래프 저장
    plt.savefig('static/data/policy/policy_impact.png', dpi=300, bbox_inches='tight')
    plt.close()
    
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
            f'region_{i+1}': {
                'hdi': region_hdi[i],
                'avg_achievement': df[df['region_id'] == i]['achievement'].mean(),
                'digital_effect': np.polyfit(
                    df[df['region_id'] == i]['digital_access'],
                    df[df['region_id'] == i]['achievement'],
                    1
                )[0]
            }
            for i in range(n_regions)
        }
    }
    
    return results 