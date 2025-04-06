import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import platform

# 운영체제별 한글 폰트 설정
if platform.system() == 'Darwin':  # macOS
    plt.rc('font', family='AppleGothic')
elif platform.system() == 'Windows':  # Windows
    plt.rc('font', family='Malgun Gothic')
else:  # Linux
    plt.rc('font', family='NanumGothic')
    
plt.rcParams['axes.unicode_minus'] = False  # 마이너스 기호 깨짐 방지

def create_digital_resources_trend():
    # 데이터 로드
    df = pd.read_csv('../data/tech_region.csv')
    
    # 연도별 평균 계산
    yearly_avg = df.groupby('연도').agg({
        '전체_대': 'sum',
        '학생용_퍼센트': 'mean',
        '교사용_퍼센트': 'mean'
    }).reset_index()
    
    # 시각화
    plt.figure(figsize=(12, 6))
    
    # 전체 컴퓨터 수 추이
    plt.subplot(1, 2, 1)
    plt.plot(yearly_avg['연도'], yearly_avg['전체_대'], marker='o')
    plt.title('연도별 전체 컴퓨터 수 변화', pad=20)
    plt.xlabel('연도')
    plt.ylabel('전체 컴퓨터 수')
    
    # 용도별 비율 추이
    plt.subplot(1, 2, 2)
    plt.plot(yearly_avg['연도'], yearly_avg['학생용_퍼센트'], marker='o', label='학생용')
    plt.plot(yearly_avg['연도'], yearly_avg['교사용_퍼센트'], marker='s', label='교사용')
    plt.title('연도별 용도별 컴퓨터 비율 변화', pad=20)
    plt.xlabel('연도')
    plt.ylabel('비율 (%)')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig('../static/data/digital_resources/digital_resources_trend.png', dpi=300, bbox_inches='tight')
    plt.close()

def create_regional_distribution():
    # 데이터 로드
    df = pd.read_csv('../data/tech_region.csv')
    
    # 2023년 데이터 필터링
    df_2023 = df[df['연도'] == 2023]
    
    # 지역별 데이터 준비
    regional_data = df_2023.groupby('구분').agg({
        '전체_대': 'sum',
        '학생용_대': 'sum',
        '교사용_대': 'sum'
    }).reset_index()
    
    # 시각화
    plt.figure(figsize=(12, 6))
    
    # 막대 그래프 생성
    x = np.arange(len(regional_data['구분']))
    width = 0.35
    
    plt.bar(x - width/2, regional_data['학생용_대'], width, label='학생용')
    plt.bar(x + width/2, regional_data['교사용_대'], width, label='교사용')
    
    plt.title('지역별 컴퓨터 보유 현황 (2023년)', pad=20)
    plt.xlabel('지역')
    plt.ylabel('컴퓨터 수')
    plt.xticks(x, regional_data['구분'], rotation=45)
    plt.legend()
    
    plt.tight_layout()
    plt.savefig('../static/data/digital_resources/region_laptop_distribution.png', dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == '__main__':
    create_digital_resources_trend()
    create_regional_distribution() 