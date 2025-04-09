import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import platform
import os
import matplotlib.cm as cm # Import colormap module

# Set font for Korean text
if platform.system() == 'Darwin':  # macOS
    plt.rcParams['font.family'] = 'AppleGothic'
else:  # Windows
    plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False

def create_overview_visualizations():
    # Read data
    df = pd.read_csv('../data/total_region.csv')
    print("Original data shape:", df.shape)
    print("Columns:", df.columns)
    
    # Create visualization directory if it doesn't exist
    os.makedirs('../static/data/overview', exist_ok=True)
    
    # Separate data into school types and regions
    school_types = ['초등학교', '중학교', '고등학교', '특수학교']
    regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
    
    # Create visualizations for school types
    school_data = df[df['구분'].isin(school_types)]
    if not school_data.empty:
        create_visualizations(school_data, '_school_types')
    
    # Create visualizations for regions
    region_data = df[df['구분'].isin(regions)]
    if not region_data.empty:
        create_visualizations(region_data, '_regions')
    
    # Create visualizations for each school type
    for school_type in school_types:
        filtered_df = df[df['구분'] == school_type]
        print(f"\nCreating visualizations for {school_type}")
        print(f"Filtered data shape: {filtered_df.shape}")
        print("Filtered data sample:")
        print(filtered_df.head())
        
        if not filtered_df.empty:
            create_visualizations(filtered_df, f'_{school_type}')

def create_visualizations(data, suffix=''):
    # Create directory if it doesn't exist
    os.makedirs('../static/data/overview', exist_ok=True)
    
    # Computer purpose distribution
    plt.figure(figsize=(10, 6))
    purposes = ['학생용', '교사용', '직원용', '기타']
    values = [data[purpose].iloc[0] for purpose in purposes]
    
    # Sort purposes and values in ascending order
    sorted_data = sorted(zip(purposes, values), key=lambda x: x[1])
    sorted_purposes, sorted_values = zip(*sorted_data)
    
    # Use a perceptually uniform colormap
    colors = cm.viridis(np.linspace(0.1, 0.9, len(sorted_purposes)))
    
    plt.bar(sorted_purposes, sorted_values, color=colors)
    plt.title(f'컴퓨터 용도별 분포{suffix}')
    plt.xlabel('용도')
    plt.ylabel('대수')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f'../static/data/overview/computer_purpose_distribution{suffix}.png')
    plt.close()
    
    # Regional distribution
    plt.figure(figsize=(12, 6))
    regions = data['구분']
    computers = data['전체']
    
    # Sort regions and computers in ascending order
    sorted_data = sorted(zip(regions, computers), key=lambda x: x[1])
    sorted_regions, sorted_computers = zip(*sorted_data)
    
    # Use a perceptually uniform colormap
    colors = cm.viridis(np.linspace(0.1, 0.9, len(sorted_regions)))
    
    plt.bar(sorted_regions, sorted_computers, color=colors)
    plt.title(f'지역별 컴퓨터 보유 현황{suffix}')
    plt.xlabel('지역')
    plt.ylabel('컴퓨터 대수')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f'../static/data/overview/regional_distribution{suffix}.png')
    plt.close()
    
    # School type distribution
    plt.figure(figsize=(10, 6))
    school_types = data['구분']
    school_counts = data['학교 수']
    
    # Sort school types and counts in ascending order
    sorted_data = sorted(zip(school_types, school_counts), key=lambda x: x[1])
    sorted_school_types, sorted_school_counts = zip(*sorted_data)
    
    # Use a perceptually uniform colormap
    colors = cm.viridis(np.linspace(0.1, 0.9, len(sorted_school_types)))
    
    plt.bar(sorted_school_types, sorted_school_counts, color=colors)
    plt.title(f'학교 유형별 분포{suffix}')
    plt.xlabel('학교 유형')
    plt.ylabel('학교 수')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f'../static/data/overview/school_type_distribution{suffix}.png')
    plt.close()
    
    # Average computer ownership by school type
    plt.figure(figsize=(12, 6))
    school_types = data['구분']
    avg_computers = data['전체'] / data['학교 수']
    
    # Sort school types and average computers in ascending order
    sorted_data = sorted(zip(school_types, avg_computers), key=lambda x: x[1])
    sorted_school_types, sorted_avg_computers = zip(*sorted_data)
    
    # Use a perceptually uniform colormap
    colors = cm.viridis(np.linspace(0.1, 0.9, len(sorted_school_types)))
    
    plt.bar(sorted_school_types, sorted_avg_computers, color=colors)
    plt.title(f'학교 유형별 평균 컴퓨터 보유 현황{suffix}')
    plt.xlabel('학교 유형')
    plt.ylabel('평균 컴퓨터 대수')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f'../static/data/overview/school_type_computers{suffix}.png')
    plt.close()

if __name__ == '__main__':
    create_overview_visualizations() 