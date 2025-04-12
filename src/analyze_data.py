import anthropic
import os
import pandas as pd
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

def load_all_csv_data():
    """Load and combine all CSV files from the data directory"""
    data_dir = Path("../data")
    all_data = []
    
    # Get all CSV files in the data directory
    csv_files = list(data_dir.glob("*.csv"))
    
    for csv_file in csv_files:
        try:
            df = pd.read_csv(csv_file)
            # Add a column to indicate the source file
            df['source_file'] = csv_file.name
            all_data.append(df)
            print(f"Loaded data from {csv_file.name}")
        except Exception as e:
            print(f"Error loading {csv_file.name}: {str(e)}")
    
    if not all_data:
        raise ValueError("No CSV files found in the data directory")
    
    # Combine all dataframes
    combined_df = pd.concat(all_data, ignore_index=True)
    return combined_df

def analyze_data(data, summary_request):
    # Initialize client with API key from environment variable
    client = anthropic.Anthropic(
        api_key=os.getenv("ANTHROPIC_API_KEY")
    )

    # Create the prompt with actual data
    prompt = f"""You will be given a set of data and asked to provide a summarized review of it. Your task is to analyze the data and present a concise summary based on a specific request.

Here is the data you will be working with:
<data>
{data}
</data>

The user has requested a specific summary of this data. Here is their request:
<summary_request>
{summary_request}
</summary_request>

To complete this task, follow these steps:

1. Carefully read and analyze the provided data.
2. Focus on the aspects of the data that are relevant to the summary request.
3. Identify key trends, patterns, or insights that address the summary request.
4. Synthesize your findings into a concise summary.
5. If appropriate, include any notable statistics or figures that support your summary.

Present your summary in the following format:

## 주요 포인트
- [List 3 key points or takeaways from your analysis]

## 데이터의 의미
[State what could be the social implications of this data in 60 words or less. Mention that your answer is not absolute and could not be totally accurate.]

Important reminders:
- Base your summary solely on the provided data. Do not introduce external information or make assumptions beyond what is presented in the data.
- Ensure your summary directly addresses the user's specific request.
- Be objective in your analysis and avoid personal opinions or speculations.
- If the data is insufficient to fully address the summary request, state this clearly in your response.
- There is no need for further analysis other than the ones written here"""

    try:
        # Create the message
        message = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=20000,
            temperature=1,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )
        return message.content[0].text if message.content else None
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return None

# Example usage
if __name__ == "__main__":
    try:
        # Load all CSV data
        print("Loading CSV files...")
        df = load_all_csv_data()
        
        # Convert DataFrame to string for analysis
        data_str = df.to_string()
        
        # Example summary request
        summary_request = "학교 유형별 컴퓨터 보유 현황과 지역별 분포를 분석해주세요."
        
        print("Analyzing data...")
        response = analyze_data(data_str, summary_request)
        if response:
            print("\nAnalysis Results:")
            print(response)
    except Exception as e:
        print(f"Error: {str(e)}") 