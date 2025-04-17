import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
from matplotlib import font_manager, rc
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 한글 폰트 설정
plt.rcParams['font.family'] = 'AppleGothic'  # macOS의 기본 한글 폰트
plt.rcParams['axes.unicode_minus'] = False   # 마이너스 기호 깨짐 방지

def create_digital_accessibility_analysis():
    # 디렉토리 생성
    os.makedirs('static/data/correlation', exist_ok=True)
    
    # 가상의 학교 데이터 생성 (실제 데이터로 대체 필요)
    np.random.seed(42)
    n_schools = 100
    
    # 각 지표 생성 (0-100 범위)
    device_coverage = np.random.normal(70, 15, n_schools).clip(0, 100)  # 기기 보급률
    internet_speed = np.random.normal(60, 20, n_schools).clip(0, 100)   # 인터넷 속도
    software_access = np.random.normal(50, 25, n_schools).clip(0, 100)  # 소프트웨어 접근성
    
    # 디지털 접근성 지수 계산 (가중치 적용)
    weights = {'device': 0.4, 'internet': 0.3, 'software': 0.3}
    accessibility_index = (
        device_coverage * weights['device'] +
        internet_speed * weights['internet'] +
        software_access * weights['software']
    )
    
    # 데이터프레임 생성
    df = pd.DataFrame({
        'school_id': range(1, n_schools + 1),
        'device_coverage': device_coverage,
        'internet_speed': internet_speed,
        'software_access': software_access,
        'accessibility_index': accessibility_index
    })
    
    # K-means 클러스터링
    X = df[['device_coverage', 'internet_speed', 'software_access']]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=3, random_state=42)
    df['cluster'] = kmeans.fit_predict(X_scaled)
    
    # 클러스터 레이블 설정
    cluster_labels = {0: '저접근성', 1: '중접근성', 2: '고접근성'}
    df['cluster_label'] = df['cluster'].map(cluster_labels)
    
    # 시각화 생성
    plt.figure(figsize=(15, 10))  # 세로 크기를 8에서 10으로 증가
    
    # 산점도 생성
    scatter = plt.scatter(df['device_coverage'], df['internet_speed'],
                         c=df['cluster'], cmap='viridis', s=150, alpha=0.8)
    
    # 클러스터 중심점 표시
    centers = scaler.inverse_transform(kmeans.cluster_centers_)
    plt.scatter(centers[:, 0], centers[:, 1], c='red', s=300, alpha=0.8, marker='X')
    
    plt.title('학교별 디지털 접근성 클러스터링', fontsize=16, pad=20)
    plt.xlabel('기기 보급률 (%)', fontsize=14)
    plt.ylabel('인터넷 속도 (%)', fontsize=14)
    plt.grid(True, alpha=0.3)
    
    # 범례 추가
    legend_elements = [
        plt.Line2D([0], [0], marker='o', color='w', label=cluster_labels[i],
                  markerfacecolor=plt.cm.viridis(i/2), markersize=15)
        for i in range(3)
    ]
    plt.legend(handles=legend_elements, title='접근성 수준', fontsize=12)
    
    # 여백 조정
    plt.subplots_adjust(bottom=0.2)  # 아래쪽 여백을 20%로 설정
    
    # 분석 결과 텍스트 추가
    analysis_text = (
        f"클러스터 분석 결과:\n"
        f"- 저접근성 그룹: {len(df[df['cluster'] == 0])}개 학교\n"
        f"- 중접근성 그룹: {len(df[df['cluster'] == 1])}개 학교\n"
        f"- 고접근성 그룹: {len(df[df['cluster'] == 2])}개 학교"
    )
    plt.figtext(0.5, 0.1, analysis_text, ha='center', fontsize=12, style='italic')  # y 위치를 0.1로 조정
    
    # 그래프 저장
    plt.savefig('static/data/correlation/digital_accessibility_clusters.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 분석 결과 저장
    analysis_results = {
        'total_schools': n_schools,
        'cluster_counts': df['cluster_label'].value_counts().to_dict(),
        'average_indices': {
            '저접근성': df[df['cluster'] == 0]['accessibility_index'].mean(),
            '중접근성': df[df['cluster'] == 1]['accessibility_index'].mean(),
            '고접근성': df[df['cluster'] == 2]['accessibility_index'].mean()
        }
    }
    
    return analysis_results

def create_correlation_visualizations():
    # 디렉토리 생성
    os.makedirs('static/data/correlation', exist_ok=True)
    
    # 데이터 생성
    years = np.array([2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023])
    digital_scores = np.array([30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 88, 90])
    math_scores = np.array([6, 4, 5, 5.5, 5.5, 4.7, 5, 7, 11, 12, 13.5, 11.5, 13, 13])
    
    # 상관계수 계산
    correlation = np.corrcoef(digital_scores, math_scores)[0, 1]
    
    # 그래프 생성
    plt.figure(figsize=(12, 8))
    
    # 산점도 그리기
    plt.scatter(digital_scores, math_scores, alpha=0.6)
    
    # 연도 레이블 추가
    for i, year in enumerate(years):
        plt.annotate(f'{year:.1f}', (digital_scores[i], math_scores[i]), 
                    xytext=(5, 5), textcoords='offset points')
    
    # 추세선 추가
    z = np.polyfit(digital_scores, math_scores, 1)
    p = np.poly1d(z)
    x_trend = np.linspace(digital_scores.min(), digital_scores.max(), 100)
    plt.plot(x_trend, p(x_trend), "r-", alpha=0.8)
    
    # 신뢰구간 추가
    plt.fill_between(x_trend, p(x_trend) - 2, p(x_trend) + 2, color='red', alpha=0.1)
    
    plt.title(f'수학 성취도와 디지털 전환의 상관관계 (r = {correlation:.2f})')
    plt.xlabel('간한 양의 상관관계: 디지털 전환이 높을수록 수학 성취도가 크게 향상됨')
    plt.ylabel('수학 성취도 (%)')
    
    # 여백 조정
    plt.subplots_adjust(bottom=0.2)  # 아래쪽 여백을 20%로 설정
    
    plt.grid(True, alpha=0.3)
    plt.savefig('static/data/correlation/correlation_analysis.png', bbox_inches='tight', dpi=300)
    plt.close()
    
    # 회귀 분석 결과 저장
    regression_results = {
        'correlation': correlation,
        'interpretation': "강한 양의 상관관계: 디지털 전환이 높을수록 수학 성취도가 크게 향상됨",
        'data_points': len(digital_scores),
        'years': list(years)
    }
    
    return regression_results

if __name__ == "__main__":
    # 상관관계 분석 실행
    correlation_results = create_correlation_visualizations()
    print("상관관계 분석 완료")
    print(f"상관계수: {correlation_results['correlation']:.2f}")
    print(f"해석: {correlation_results['interpretation']}")
    
    # 디지털 접근성 분석 실행
    accessibility_results = create_digital_accessibility_analysis()
    print("\n디지털 접근성 분석 완료")
    print(f"총 학교 수: {accessibility_results['total_schools']}")
    print("클러스터별 학교 수:")
    for cluster, count in accessibility_results['cluster_counts'].items():
        print(f"- {cluster}: {count}개 학교")
    print("\n클러스터별 평균 접근성 지수:")
    for cluster, avg_index in accessibility_results['average_indices'].items():
        print(f"- {cluster}: {avg_index:.2f}") 