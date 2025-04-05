import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

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
plt.figure(figsize=(12, 8))

# Plot 1: Digital Resources vs Operating Rate
plt.subplot(2, 2, 1)
sns.regplot(x='전체_대', y='전체_운영률', data=merged_df)
plt.title('전체 컴퓨터 수와 학교 운영률의 상관관계')
plt.xlabel('전체 컴퓨터 수')
plt.ylabel('학교 운영률 (%)')

# Plot 2: Student Computers vs Operating Rate
plt.subplot(2, 2, 2)
sns.regplot(x='학생용_퍼센트', y='전체_운영률', data=merged_df)
plt.title('학생용 컴퓨터 비율과 학교 운영률의 상관관계')
plt.xlabel('학생용 컴퓨터 비율 (%)')
plt.ylabel('학교 운영률 (%)')

# Plot 3: Teacher Computers vs Operating Rate
plt.subplot(2, 2, 3)
sns.regplot(x='교사용_퍼센트', y='전체_운영률', data=merged_df)
plt.title('교사용 컴퓨터 비율과 학교 운영률의 상관관계')
plt.xlabel('교사용 컴퓨터 비율 (%)')
plt.ylabel('학교 운영률 (%)')

# Calculate correlation coefficients
correlation_total = np.corrcoef(merged_df['전체_대'], merged_df['전체_운영률'])[0, 1]
correlation_student = np.corrcoef(merged_df['학생용_퍼센트'], merged_df['전체_운영률'])[0, 1]
correlation_teacher = np.corrcoef(merged_df['교사용_퍼센트'], merged_df['전체_운영률'])[0, 1]

print("Correlation coefficients:")
print("Total computers vs Operating rate:", correlation_total)
print("Student computers vs Operating rate:", correlation_student)
print("Teacher computers vs Operating rate:", correlation_teacher)

# Add correlation coefficients to the plots
plt.subplot(2, 2, 1).text(0.05, 0.95, f'상관계수: {correlation_total:.2f}', 
                         transform=plt.subplot(2, 2, 1).transAxes)
plt.subplot(2, 2, 2).text(0.05, 0.95, f'상관계수: {correlation_student:.2f}', 
                         transform=plt.subplot(2, 2, 2).transAxes)
plt.subplot(2, 2, 3).text(0.05, 0.95, f'상관계수: {correlation_teacher:.2f}', 
                         transform=plt.subplot(2, 2, 3).transAxes)

# Add region labels to the points
for i, row in merged_df.iterrows():
    plt.subplot(2, 2, 1).text(row['전체_대'], row['전체_운영률'], row['구분'], 
                             fontsize=8, ha='center', va='bottom')
    plt.subplot(2, 2, 2).text(row['학생용_퍼센트'], row['전체_운영률'], row['구분'], 
                             fontsize=8, ha='center', va='bottom')
    plt.subplot(2, 2, 3).text(row['교사용_퍼센트'], row['전체_운영률'], row['구분'], 
                             fontsize=8, ha='center', va='bottom')

plt.tight_layout()
plt.savefig('../static/correlation_analysis.png')
plt.close()

# Create a summary table
summary_df = merged_df[['구분', '전체_대', '학생용_퍼센트', '교사용_퍼센트', '전체_운영률']]
summary_df.columns = ['지역', '전체 컴퓨터 수', '학생용 컴퓨터 비율 (%)', '교사용 컴퓨터 비율 (%)', '학교 운영률 (%)']
print("Summary DataFrame shape:", summary_df.shape)
print("Summary DataFrame columns:", summary_df.columns)
summary_df.to_csv('../data/correlation_summary.csv', index=False, encoding='utf-8-sig') 