import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import matplotlib.font_manager as fm

# Set up Korean font
plt.rcParams['font.family'] = 'AppleGothic'  # For macOS
plt.rcParams['axes.unicode_minus'] = False  # Fix minus sign

# Read the data
df = pd.read_csv('../data/region_laptop.csv')

# Filter for regional data (excluding school types)
regions = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', 
           '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도', 
           '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', 
           '제주특별자치도']
region_df = df[df['구분'].isin(regions)]

# Create a bar plot for laptop distribution
plt.figure(figsize=(15, 8))
sns.set_style("whitegrid")
plt.rc('font', family='AppleGothic')  # For macOS

# Plot student laptop percentage
plt.bar(region_df['구분'], region_df['학생용_퍼센트'], label='학생용', alpha=0.7)
# Plot teacher laptop percentage
plt.bar(region_df['구분'], region_df['교사용_퍼센트'], bottom=region_df['학생용_퍼센트'], 
        label='교사용', alpha=0.7)
# Plot staff laptop percentage
plt.bar(region_df['구분'], region_df['직원용_퍼센트'], 
        bottom=region_df['학생용_퍼센트'] + region_df['교사용_퍼센트'],
        label='직원용', alpha=0.7)
# Plot other laptop percentage
plt.bar(region_df['구분'], region_df['기타_퍼센트'],
        bottom=region_df['학생용_퍼센트'] + region_df['교사용_퍼센트'] + region_df['직원용_퍼센트'],
        label='기타', alpha=0.7)

plt.title('지역별 노트북 활용 현황', fontsize=16, pad=20)
plt.xlabel('지역', fontsize=12, labelpad=10)
plt.ylabel('비율 (%)', fontsize=12, labelpad=10)
plt.xticks(rotation=45, ha='right')
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()

# Save the plot with higher DPI and quality
plt.savefig('../static/region_laptop_distribution.png', 
            dpi=300, bbox_inches='tight', pad_inches=0.5)
plt.close()

# Create a summary CSV file with proper encoding
summary_df = region_df[['구분', '노트북_전체', '학생용_대', '학생용_퍼센트', 
                       '교사용_대', '교사용_퍼센트', '직원용_대', '직원용_퍼센트']]
summary_df.to_csv('../data/region_laptop_summary.csv', 
                 index=False, encoding='utf-8-sig') 