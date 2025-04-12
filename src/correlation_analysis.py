import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import matplotlib.font_manager as fm
import platform
import os

# 운영체제별 한글 폰트 설정
if platform.system() == 'Darwin':  # macOS
    plt.rc('font', family='AppleGothic')
elif platform.system() == 'Windows':  # Windows
    plt.rc('font', family='Malgun Gothic')
else:  # Linux
    plt.rc('font', family='NanumGothic')
    
plt.rcParams['axes.unicode_minus'] = False  # 마이너스 기호 깨짐 방지

# Read the data
tech_df = pd.read_csv('../data/tech_region.csv')
grade_df = pd.read_csv('../data/region_grade.csv')

print("Tech DataFrame columns:", tech_df.columns)
print("Grade DataFrame columns:", grade_df.columns)

# Convert percentage strings to float
grade_df['전체_운영률'] = grade_df['전체_운영률'].str.rstrip('%').astype('float')

# Create a mapping for region names
region_mapping = {
    '서울특별시': '서울',
    '부산광역시': '부산',
    '대구광역시': '대구',
    '인천광역시': '인천',
    '광주광역시': '광주',
    '대전광역시': '대전',
    '울산광역시': '울산',
    '세종특별자치시': '세종',
    '경기도': '경기',
    '강원특별자치도': '강원',
    '충청북도': '충북',
    '충청남도': '충남',
    '전라북도': '전북',
    '전라남도': '전남',
    '경상북도': '경북',
    '경상남도': '경남',
    '제주특별자치도': '제주'
}

# Map the region names in tech_df
tech_df['구분'] = tech_df['구분'].map(region_mapping).fillna(tech_df['구분'])

# Calculate average digital resources for each region
tech_2023 = tech_df[tech_df['연도'] == 2023]
print("Tech 2023 data shape:", tech_2023.shape)
print("Tech 2023 unique regions:", tech_2023['구분'].unique())

tech_by_region = tech_2023.groupby('구분').agg({
    '전체_대': 'sum',
    '학생용_퍼센트': 'mean',
    '교사용_퍼센트': 'mean'
}).reset_index()

print("Tech by region shape:", tech_by_region.shape)
print("Tech by region columns:", tech_by_region.columns)

# Merge the data
merged_df = pd.merge(tech_by_region, grade_df, left_on='구분', right_on='지역')
print("Merged DataFrame shape:", merged_df.shape)
print("Merged DataFrame columns:", merged_df.columns)

# Create correlation visualization
plt.figure(figsize=(15, 5))

# Plot 1: Digital Resources vs Operating Rate
plt.subplot(1, 3, 1)
sns.regplot(x='전체_대', y='전체_운영률', data=merged_df)
plt.title('컴퓨터 보유율과\n학교 운영률의 상관관계', pad=20)
plt.xlabel('전체 컴퓨터 수')
plt.ylabel('학교 운영률 (%)')

# Plot 2: Student Computers vs Operating Rate
plt.subplot(1, 3, 2)
sns.regplot(x='학생용_퍼센트', y='전체_운영률', data=merged_df)
plt.title('학생용 컴퓨터 비율과\n학교 운영률의 상관관계', pad=20)
plt.xlabel('학생용 컴퓨터 비율 (%)')
plt.ylabel('학교 운영률 (%)')

# Plot 3: Teacher Computers vs Operating Rate
plt.subplot(1, 3, 3)
sns.regplot(x='교사용_퍼센트', y='전체_운영률', data=merged_df)
plt.title('교사용 컴퓨터 비율과\n학교 운영률의 상관관계', pad=20)
plt.xlabel('교사용 컴퓨터 비율 (%)')
plt.ylabel('학교 운영률 (%)')

# Calculate correlation coefficients
corr_total = np.corrcoef(merged_df['전체_대'], merged_df['전체_운영률'])[0, 1]
corr_student = np.corrcoef(merged_df['학생용_퍼센트'], merged_df['전체_운영률'])[0, 1]
corr_teacher = np.corrcoef(merged_df['교사용_퍼센트'], merged_df['전체_운영률'])[0, 1]

print("Correlation coefficients:")
print("Total computers vs Operating rate:", corr_total)
print("Student computers vs Operating rate:", corr_student)
print("Teacher computers vs Operating rate:", corr_teacher)

# Add correlation coefficients to the plots
plt.subplot(1, 3, 1).text(0.05, 0.95, f'상관계수: {corr_total:.2f}', 
                         transform=plt.subplot(1, 3, 1).transAxes)
plt.subplot(1, 3, 2).text(0.05, 0.95, f'상관계수: {corr_student:.2f}', 
                         transform=plt.subplot(1, 3, 2).transAxes)
plt.subplot(1, 3, 3).text(0.05, 0.95, f'상관계수: {corr_teacher:.2f}', 
                         transform=plt.subplot(1, 3, 3).transAxes)

# Add region labels to the points
for i, row in merged_df.iterrows():
    plt.subplot(1, 3, 1).text(row['전체_대'], row['전체_운영률'], row['구분'], 
                             fontsize=8, ha='center', va='bottom')
    plt.subplot(1, 3, 2).text(row['학생용_퍼센트'], row['전체_운영률'], row['구분'], 
                             fontsize=8, ha='center', va='bottom')
    plt.subplot(1, 3, 3).text(row['교사용_퍼센트'], row['전체_운영률'], row['구분'], 
                             fontsize=8, ha='center', va='bottom')

plt.tight_layout()
plt.savefig('../static/data/correlation/correlation_analysis.png', dpi=300, bbox_inches='tight')
plt.close()

# Create a summary table
summary_df = merged_df[['구분', '전체_대', '학생용_퍼센트', '교사용_퍼센트', '전체_운영률']]
summary_df.columns = ['지역', '전체 컴퓨터 수', '학생용 컴퓨터 비율 (%)', '교사용 컴퓨터 비율 (%)', '학교 운영률 (%)']
print("Summary DataFrame shape:", summary_df.shape)
print("Summary DataFrame columns:", summary_df.columns)
summary_df.to_csv('../data/correlation_summary.csv', index=False, encoding='utf-8-sig')

def create_correlation_visualization():
    # 데이터 로드
    tech_data = pd.read_csv('../data/tech_region.csv')
    achievement_data = pd.read_csv('../static/data/achievement/achievement_summary.csv')
    
    # 2023년 데이터만 선택
    tech_data_2023 = tech_data[tech_data['연도'] == 2023].copy()
    
    # 시 지역 데이터 제외
    tech_data_2023 = tech_data_2023[tech_data_2023['구분'] != '시 지역(특별/광역시)']
    
    # 컴퓨터 사용 비율 계산 (학생용 컴퓨터 비율)
    tech_data_2023['computer_usage_ratio'] = tech_data_2023['학생용_퍼센트'] / 100
    
    # 2023년 평균 성취도
    achievement_2023_avg = achievement_data[achievement_data['year'] == 2023]['average_score'].iloc[0]
    
    # 시각화 디렉토리 생성
    os.makedirs('../static/data/correlation', exist_ok=True)
    
    # 산점도 그리기
    plt.figure(figsize=(12, 8))
    plt.scatter(tech_data_2023['computer_usage_ratio'], 
               [achievement_2023_avg] * len(tech_data_2023),
               alpha=0.6)
    
    # 회귀선 추가
    z = np.polyfit(tech_data_2023['computer_usage_ratio'], 
                  [achievement_2023_avg] * len(tech_data_2023), 1)
    p = np.poly1d(z)
    x_range = np.linspace(tech_data_2023['computer_usage_ratio'].min(), 
                         tech_data_2023['computer_usage_ratio'].max(), 100)
    plt.plot(x_range, p(x_range), "r--", alpha=0.8)
    
    plt.title('지역별 학생용 컴퓨터 비율과 성취도의 상관관계 (2023년)', fontsize=14, pad=20)
    plt.xlabel('학생용 컴퓨터 비율', fontsize=12)
    plt.ylabel('평균 성취도', fontsize=12)
    plt.grid(True, alpha=0.3)
    
    # 상관계수 계산
    correlation = np.corrcoef(tech_data_2023['computer_usage_ratio'], 
                            [achievement_2023_avg] * len(tech_data_2023))[0,1]
    
    # 상관계수 텍스트 추가
    plt.text(0.05, 0.95, f'상관계수: {correlation:.3f}',
             transform=plt.gca().transAxes, fontsize=12,
             verticalalignment='top', 
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    # 지역 레이블 추가
    for i, txt in enumerate(tech_data_2023['구분']):
        plt.annotate(txt, 
                    (tech_data_2023['computer_usage_ratio'].iloc[i], 
                     achievement_2023_avg),
                    xytext=(5, 5), textcoords='offset points',
                    fontsize=10)
    
    # 그래프 저장
    plt.savefig('../static/data/correlation/computer_achievement_correlation.png', 
                dpi=300, bbox_inches='tight')
    plt.close()
    
    # 상관관계 요약 저장
    summary = {
        '상관계수': correlation,
        '설명': '2023년 지역별 학생용 컴퓨터 비율과 성취도의 상관관계를 보여주는 그래프입니다.'
    }
    pd.DataFrame([summary]).to_csv('../static/data/correlation/correlation_summary.csv', 
                                 index=False, encoding='utf-8-sig')

if __name__ == '__main__':
    create_correlation_visualization() 