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
    # Read the original data (before filtering)
    df = pd.read_csv('../data/total_region_original.csv')  # Use the original data file
    print("Original data shape:", df.shape)
    print("Columns:", df.columns)
    
    # Create visualizations with all data
    create_visualizations(df, '')

def create_visualizations(data, suffix=''):
    # Create directory if it doesn't exist
    os.makedirs('../static/data/overview', exist_ok=True)
    
    # School types for filtering
    school_types = ['초등학교', '중학교', '일반고', '특성화고', '자율고', '특수목적고', '특수학교']
    
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
    
    # Regional distribution (excluding school types)
    plt.figure(figsize=(12, 6))
    regions = data[~data['구분'].isin(school_types)]
    
    if not regions.empty:
        sorted_data = sorted(zip(regions['구분'], regions['전체']), key=lambda x: x[1], reverse=True)
        sorted_regions, sorted_computers = zip(*sorted_data)
        
        colors = cm.viridis(np.linspace(0.1, 0.9, len(sorted_regions)))
        plt.bar(sorted_regions, sorted_computers, color=colors)
        plt.title(f'지역별 컴퓨터 보유 현황{suffix}')
        plt.xlabel('지역')
        plt.ylabel('컴퓨터 대수')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f'../static/data/overview/regional_distribution{suffix}.png')
    plt.close()
    
    # School type distribution (only school types)
    plt.figure(figsize=(10, 6))
    school_data = data[data['구분'].isin(school_types)]
    
    if not school_data.empty:
        sorted_data = sorted(zip(school_data['구분'], school_data['학교 수']), key=lambda x: x[1], reverse=True)
        sorted_school_types, sorted_school_counts = zip(*sorted_data)
        
        colors = cm.viridis(np.linspace(0.1, 0.9, len(sorted_school_types)))
        plt.bar(sorted_school_types, sorted_school_counts, color=colors)
        plt.title(f'학교 유형별 분포{suffix}')
        plt.xlabel('학교 유형')
        plt.ylabel('학교 수')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f'../static/data/overview/school_type_distribution{suffix}.png')
    plt.close()
    
    # Average computer ownership by school type (only school types)
    plt.figure(figsize=(12, 6))
    if not school_data.empty:
        avg_computers = school_data['전체'] / school_data['학교 수']
        sorted_data = sorted(zip(school_data['구분'], avg_computers), key=lambda x: x[1], reverse=True)
        sorted_school_types, sorted_avg_computers = zip(*sorted_data)
        
        colors = cm.viridis(np.linspace(0.1, 0.9, len(sorted_school_types)))
        plt.bar(sorted_school_types, sorted_avg_computers, color=colors)
        plt.title(f'학교 유형별 평균 컴퓨터 보유 현황{suffix}')
        plt.xlabel('학교 유형')
        plt.ylabel('평균 컴퓨터 대수')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f'../static/data/overview/average_computer_ownership{suffix}.png')
    plt.close()

def create_regional_distribution(df, save_dir, suffix=''):
    """Create regional distribution visualization"""
    print(f"Creating regional distribution visualization for {suffix if suffix else 'all schools'}")
    
    # Exclude specific school type columns
    columns_to_exclude = [
        '초등학교', '중학교', '일반고', '특성화고', 
        '자율고', '특수목적고', '특수학교'
    ]
    
    # Filter out the columns we don't want
    regional_data = df.drop(columns=columns_to_exclude, errors='ignore')
    
    # Get the remaining columns (which should be regional data)
    regional_columns = [col for col in regional_data.columns if col not in ['source_file']]
    
    plt.figure(figsize=(12, 8))
    regional_data[regional_columns].sum().plot(kind='bar', color=cm.viridis(np.linspace(0, 1, len(regional_columns))))
    plt.title(f'지역별 컴퓨터 보유 현황 {suffix}')
    plt.xlabel('지역')
    plt.ylabel('컴퓨터 수')
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    # Save the visualization
    save_path = os.path.join(save_dir, f'regional_distribution{suffix}.png')
    plt.savefig(save_path)
    plt.close()
    print(f"Saved regional distribution visualization to {save_path}")
    
    return save_path

if __name__ == '__main__':
    create_overview_visualizations() 