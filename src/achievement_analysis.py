import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import platform
from matplotlib.font_manager import FontProperties

# Set font for Korean characters
if platform.system() == 'Darwin':  # macOS
    plt.rc('font', family='AppleGothic')
elif platform.system() == 'Windows':  # Windows
    plt.rc('font', family='Malgun Gothic')
plt.rcParams['axes.unicode_minus'] = False

def create_achievement_visualizations():
    # Create directory if it doesn't exist
    output_dir = '../static/data/achievement'
    os.makedirs(output_dir, exist_ok=True)
    
    # Read data
    middle_school_data = pd.read_csv('../static/data/grade/middle_school_comparison.csv')
    high_school_data = pd.read_csv('../static/data/grade/high_school_comparison.csv')
    
    # Create timeline visualization for both school types
    plt.figure(figsize=(15, 10))
    
    # Plot for middle schools
    plt.subplot(2, 1, 1)
    years_middle = middle_school_data['Year'].astype(str)
    metrics_middle = middle_school_data['Key Metrics']
    
    # Create a text-based visualization
    for i, (year, metric) in enumerate(zip(years_middle, metrics_middle)):
        plt.text(0, i, f"{year}: {metric}", 
                fontsize=10, 
                bbox=dict(facecolor='lightblue', alpha=0.5, edgecolor='none', pad=5))
    
    plt.title('중학교 학업 성취도 변화 (2010-2024)', pad=20)
    plt.axis('off')
    plt.ylim(-1, len(years_middle))
    
    # Plot for high schools
    plt.subplot(2, 1, 2)
    years_high = high_school_data['Year'].astype(str)
    metrics_high = high_school_data['Key Metrics']
    
    # Create a text-based visualization
    for i, (year, metric) in enumerate(zip(years_high, metrics_high)):
        plt.text(0, i, f"{year}: {metric}", 
                fontsize=10, 
                bbox=dict(facecolor='lightgreen', alpha=0.5, edgecolor='none', pad=5))
    
    plt.title('고등학교 학업 성취도 변화 (2010-2024)', pad=20)
    plt.axis('off')
    plt.ylim(-1, len(years_high))
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'achievement_timeline.png'), 
                bbox_inches='tight', dpi=300)
    plt.close()
    
    # Create comparison visualization
    plt.figure(figsize=(12, 8))
    
    # Create a comparison table
    comparison_data = pd.DataFrame({
        'Year': years_middle,
        '중학교': metrics_middle,
        '고등학교': metrics_high
    })
    
    # Create a table visualization
    ax = plt.subplot(111, frame_on=False)
    ax.xaxis.set_visible(False)
    ax.yaxis.set_visible(False)
    
    table = plt.table(cellText=comparison_data.values,
                     colLabels=comparison_data.columns,
                     cellLoc='left',
                     loc='center',
                     colWidths=[0.2, 0.4, 0.4])
    
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1.2, 1.5)
    
    plt.title('서울시와 경기도의 학업 성취도 비교', pad=20)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'region_comparison.png'), 
                bbox_inches='tight', dpi=300)
    plt.close()

if __name__ == '__main__':
    create_achievement_visualizations() 