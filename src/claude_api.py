import anthropic
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ClaudeAPI:
    def __init__(self):
        # Get API key from environment variable
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        
        # Initialize Anthropic client
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def generate_response(self, data, summary_request, max_tokens=20000, temperature=1):
        try:
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

You MUST format your response EXACTLY as follows:

## 주요 포인트
- Point 1: [First key point]
- Point 2: [Second key point]
- Point 3: [Third key point]

## 데이터의 의미
[Exactly 60 words or less about the social implications of this data. Include a note that this interpretation is not absolute and may not be totally accurate.]

Important reminders:
- Base your summary solely on the provided data. Do not introduce external information or make assumptions beyond what is presented in the data.
- Ensure your summary directly addresses the user's specific request.
- Be objective in your analysis and avoid personal opinions or speculations.
- If the data is insufficient to fully address the summary request, state this clearly in your response.
- There is no need for further analysis other than the ones written here
- You MUST follow the exact format specified above with the two sections and bullet points
- Do not add any additional sections or content beyond what is specified"""

            message = self.client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=max_tokens,
                temperature=temperature,
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
        claude = ClaudeAPI()
        # Example data and request
        data = "Your data here"
        summary_request = "Your summary request here"
        response = claude.generate_response(data, summary_request)
        if response:
            print(response)
    except Exception as e:
        print(f"Error: {str(e)}") 