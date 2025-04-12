from claude_api import ClaudeAPI
import os
from dotenv import load_dotenv, find_dotenv

def test_claude_api():
    # Force reload environment variables
    dotenv_path = find_dotenv()
    load_dotenv(dotenv_path, override=True)
    
    # Debug: Check API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key:
        print(f"\nAPI Key loaded: Yes")
        print(f"API Key length: {len(api_key)}")
        print(f"API Key first 5 chars: {api_key[:5]}")
        print(f"API Key path: {dotenv_path}")
    else:
        print("\nAPI Key loaded: No")
        return
    
    # Sample data
    data = """
    학교 유형별 컴퓨터 보유 현황 (2023년)
    초등학교: 6359개 학교, 평균 100대
    중학교: 3278개 학교, 평균 150대
    고등학교: 0개 학교, 데이터 없음
    특수학교: 193개 학교, 평균 50대
    """
    
    # Sample request
    summary_request = "학교 유형별 컴퓨터 보유 현황을 분석하고, 교육 현장에서의 디지털 격차에 대해 설명해주세요."
    
    try:
        claude = ClaudeAPI()
        response = claude.generate_response(data, summary_request)
        
        print("\n=== Test Response ===")
        print(response)
        print("\n=== Response Format Check ===")
        
        # Check if response contains required sections
        if "## 주요 포인트" in response and "## 데이터의 의미" in response:
            print("✅ Required sections present")
            
            # Check bullet points format
            points = [line for line in response.split('\n') if line.startswith('- Point')]
            if len(points) == 3:
                print("✅ Correct number of bullet points")
            else:
                print("❌ Incorrect number of bullet points")
                
            # Check word count for 데이터의 의미 section
            meaning_section = response.split("## 데이터의 의미")[1].strip()
            word_count = len(meaning_section.split())
            if word_count <= 60:
                print(f"✅ Word count within limit: {word_count} words")
            else:
                print(f"❌ Word count exceeds limit: {word_count} words")
        else:
            print("❌ Missing required sections")
            
    except Exception as e:
        print(f"Error during test: {str(e)}")

if __name__ == "__main__":
    test_claude_api() 