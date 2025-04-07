import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import platform
import os

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
    
    # Create visualizations for all data
    create_visualizations(df, '')
    
    # Create visualizations for school types
    school_types = ['초등학교', '중학교', '특수학교']
    for school_type in school_types:
        # Filter data by school type
        filtered_df = df[df['구분'] == school_type]
        print(f"\nCreating visualizations for {school_type}")
        print(f"Filtered data shape: {filtered_df.shape}")
        print("Filtered data sample:")
        print(filtered_df.head())
        
        if not filtered_df.empty:
            create_visualizations(filtered_df, f'_{school_type}')

def create_visualizations(df, suffix):
    # Computer purpose distribution (전국 평균)
    computer_purposes = ['학생용', '교사용', '직원용', '기타']
    purpose_values = df[computer_purposes].sum()
    plt.figure(figsize=(10, 6))
    plt.pie(purpose_values, labels=computer_purposes, autopct='%1.1f%%', startangle=90)
    plt.title(f'컴퓨터 용도별 분포{suffix.replace("_", " ")}')
    plt.axis('equal')
    plt.savefig(f'../static/data/overview/computer_purpose_distribution{suffix}.png')
    plt.close()

    # School type distribution
    school_counts = df['구분'].value_counts()
    plt.figure(figsize=(10, 6))
    if not school_counts.empty:
        plt.pie(school_counts, labels=school_counts.index, autopct='%1.1f%%', startangle=90)
        plt.title(f'학교 유형별 분포{suffix.replace("_", " ")}')
        plt.axis('equal')
        plt.savefig(f'../static/data/overview/school_type_distribution{suffix}.png')
    plt.close()

    # Regional distribution (top 10)
    region_computers = df.groupby('구분')['전체'].sum().sort_values(ascending=False)
    plt.figure(figsize=(12, 6))
    if not region_computers.empty:
        region_computers.head(10).plot(kind='bar')
        plt.title(f'지역별 컴퓨터 보유 현황 (Top 10){suffix.replace("_", " ")}')
        plt.xlabel('지역')
        plt.ylabel('컴퓨터 수')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f'../static/data/overview/regional_distribution{suffix}.png')
    plt.close()

    # Computer distribution by school type
    school_computers = df.groupby('구분')['전체'].mean()
    plt.figure(figsize=(10, 6))
    if not school_computers.empty:
        school_computers.plot(kind='bar')
        plt.title(f'학교 유형별 평균 컴퓨터 보유 현황{suffix.replace("_", " ")}')
        plt.xlabel('학교 유형')
        plt.ylabel('평균 컴퓨터 수')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f'../static/data/overview/school_type_computers{suffix}.png')
    plt.close()

if __name__ == '__main__':
    create_overview_visualizations() 