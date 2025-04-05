import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Read the CSV file
df = pd.read_csv('../data/tech_region.csv')

# Set the style
plt.style.use('seaborn')
sns.set_palette("husl")

# Create a figure with subplots
fig, axes = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle('디지털 자원 변화 추이 (2021-2023)', fontsize=16)

# 1. Total Computers Trend
total_computers = df.groupby('연도')['전체_대'].sum()
axes[0, 0].plot(total_computers.index, total_computers.values, marker='o')
axes[0, 0].set_title('전체 컴퓨터 수 변화')
axes[0, 0].set_xlabel('연도')
axes[0, 0].set_ylabel('대수')

# 2. Student Computers Percentage Trend
student_pct = df.groupby('연도')['학생용_퍼센트'].mean()
axes[0, 1].plot(student_pct.index, student_pct.values, marker='o', color='green')
axes[0, 1].set_title('학생용 컴퓨터 비율 변화')
axes[0, 1].set_xlabel('연도')
axes[0, 1].set_ylabel('비율 (%)')

# 3. Teacher Computers Percentage Trend
teacher_pct = df.groupby('연도')['교사용_퍼센트'].mean()
axes[1, 0].plot(teacher_pct.index, teacher_pct.values, marker='o', color='red')
axes[1, 0].set_title('교사용 컴퓨터 비율 변화')
axes[1, 0].set_xlabel('연도')
axes[1, 0].set_ylabel('비율 (%)')

# 4. Staff Computers Percentage Trend
staff_pct = df.groupby('연도')['직원용_퍼센트'].mean()
axes[1, 1].plot(staff_pct.index, staff_pct.values, marker='o', color='purple')
axes[1, 1].set_title('직원용 컴퓨터 비율 변화')
axes[1, 1].set_xlabel('연도')
axes[1, 1].set_ylabel('비율 (%)')

# Adjust layout and save
plt.tight_layout()
plt.savefig('../static/digital_resources_trend.png')
plt.close()

# Create a summary table
summary = pd.DataFrame({
    '연도': [2021, 2022, 2023],
    '전체 컴퓨터 수': total_computers.values,
    '학생용 컴퓨터 비율 (%)': student_pct.values,
    '교사용 컴퓨터 비율 (%)': teacher_pct.values,
    '직원용 컴퓨터 비율 (%)': staff_pct.values
})

# Save summary to CSV
summary.to_csv('../data/digital_resources_summary.csv', index=False, encoding='utf-8-sig') 