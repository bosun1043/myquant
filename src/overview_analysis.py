import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import platform

# Set font for Korean text
if platform.system() == 'Darwin':  # macOS
    plt.rcParams['font.family'] = 'AppleGothic'
elif platform.system() == 'Windows':
    plt.rcParams['font.family'] = 'Malgun Gothic'
else:
    plt.rcParams['font.family'] = 'NanumGothic'

plt.rcParams['axes.unicode_minus'] = False

def create_overview_visualizations():
    # Read data
    df = pd.read_csv('../data/total_region.csv')
    
    # Filter rows for school types only
    school_types = ['초등학교', '중학교', '일반고', '특성화고', '자율고', '특수목적고', '특수학교']
    school_df = df[df['구분'].isin(school_types)]
    
    # Computer purpose distribution (전국 평균)
    computer_purposes = ['학생용', '교사용', '직원용', '기타']
    computer_values = df.iloc[1][computer_purposes]  # Use second row (전체) for national average
    
    plt.figure(figsize=(10, 8))
    plt.pie(computer_values, labels=computer_purposes, autopct='%1.1f%%')
    plt.title('전국 컴퓨터 용도별 분포')
    plt.savefig('../static/data/overview/computer_purpose_distribution.png', 
                bbox_inches='tight', dpi=300)
    plt.close()

    # School type distribution
    plt.figure(figsize=(12, 8))
    plt.pie(school_df['학교 수'], labels=school_df['구분'], autopct='%1.1f%%')
    plt.title('학교 유형별 분포')
    plt.savefig('../static/data/overview/school_type_distribution.png', 
                bbox_inches='tight', dpi=300)
    plt.close()

    # Regional distribution (top 10)
    regions = df[df['구분'].str.contains('특별|광역|도$', na=False)]
    regions = regions.sort_values(by='전체', ascending=False).head(10)

    plt.figure(figsize=(15, 8))
    sns.barplot(data=regions, x='구분', y='전체')
    plt.xticks(rotation=45, ha='right')
    plt.title('지역별 학교당 평균 컴퓨터 보유 현황 (상위 10개 지역)')
    plt.ylabel('학교당 평균 컴퓨터 수')
    plt.tight_layout()
    plt.savefig('../static/data/overview/regional_distribution.png', 
                bbox_inches='tight', dpi=300)
    plt.close()

    # Computer distribution by school type
    plt.figure(figsize=(15, 8))
    sns.barplot(data=school_df, x='구분', y='전체')
    plt.title('학교 유형별 평균 컴퓨터 보유 현황')
    plt.ylabel('학교당 평균 컴퓨터 수')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('../static/data/overview/school_type_computers.png', 
                bbox_inches='tight', dpi=300)
    plt.close()

if __name__ == '__main__':
    create_overview_visualizations() 