import pandas as pd

def filter_school_types():
    # Read the CSV file
    df = pd.read_csv('../data/total_region.csv')
    print("Original data shape:", df.shape)
    
    # List of categories to remove (school types + summary rows)
    categories_to_remove = [
        '초등학교', '중학교', '일반고', '특성화고', '자율고', '특수목적고', '특수학교',
        '전체', '계'  # Added summary rows
    ]
    
    # Filter out the categories
    df_filtered = df[~df['구분'].isin(categories_to_remove)]
    
    # Save back to CSV
    df_filtered.to_csv('../data/total_region.csv', index=False)
    
    print('\nFiltered data shape:', df_filtered.shape)
    print('\nRemaining categories:')
    print(df_filtered['구분'].tolist())

if __name__ == '__main__':
    filter_school_types() 