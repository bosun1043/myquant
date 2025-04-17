import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
from matplotlib import font_manager, rc

# 한글 폰트 설정
plt.rcParams['font.family'] = 'AppleGothic'  # macOS의 기본 한글 폰트
plt.rcParams['axes.unicode_minus'] = False   # 마이너스 기호 깨짐 방지

def create_correlation_visualizations():
    # 디렉토리 생성
    os.makedirs('static/data/correlation', exist_ok=True)
    
    # 성취도 데이터 (2010-2023)
    achievement_data = {
        'year': list(range(2010, 2024)),
        'math_achievement': [5.9, 4.0, 5.0, 5.2, 5.7, 4.6, 4.9, 7.1, 11.1, 11.8, 13.4, 11.6, 13.2, 13.0],
        'digital_transformation': [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]  # 디지털 전환 지수 (가상 데이터)
    }
    
    df = pd.DataFrame(achievement_data)
    
    # 상관계수 계산
    correlation = df['math_achievement'].corr(df['digital_transformation'])
    
    # 시각화 생성
    plt.figure(figsize=(12, 6))
    
    # 산점도와 회귀선
    sns.regplot(x='digital_transformation', y='math_achievement', data=df, 
                scatter_kws={'s': 100, 'alpha': 0.7}, line_kws={'color': 'red'})
    
    # 각 점에 연도 표시
    for i, row in df.iterrows():
        plt.annotate(str(row['year']), (row['digital_transformation'], row['math_achievement']),
                    xytext=(5, 5), textcoords='offset points')
    
    plt.title(f'수학 성취도와 디지털 전환의 상관관계 (r = {correlation:.2f})', fontsize=14, pad=20)
    plt.xlabel('디지털 전환 지수 (%)', fontsize=12)
    plt.ylabel('수학 성취도 (%)', fontsize=12)
    plt.grid(True, alpha=0.3)
    
    # 상관관계 해석 텍스트 추가
    interpretation = f"상관계수: {correlation:.2f}\n"
    if correlation > 0.7:
        interpretation += "강한 양의 상관관계: 디지털 전환이 증가할수록 수학 성취도가 크게 향상됨"
    elif correlation > 0.3:
        interpretation += "중간 정도의 양의 상관관계: 디지털 전환과 수학 성취도가 함께 증가하는 경향"
    else:
        interpretation += "약한 상관관계: 디지털 전환과 수학 성취도의 관계가 불명확함"
    
    plt.figtext(0.5, 0.02, interpretation, ha='center', fontsize=10, style='italic')
    
    # 그래프 저장
    plt.tight_layout()
    plt.savefig('static/data/correlation/correlation_analysis.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 회귀 분석 결과 저장
    regression_results = {
        'correlation': correlation,
        'interpretation': interpretation,
        'data_points': len(df),
        'years': list(range(2010, 2024))
    }
    
    return regression_results

if __name__ == "__main__":
    results = create_correlation_visualizations()
    print("상관관계 분석 완료")
    print(f"상관계수: {results['correlation']:.2f}")
    print(f"해석: {results['interpretation']}") 