import httpx
from typing import Any, Optional
from app.core.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemma-3-27b-it:free"


def extract_text_from_content(content: Any) -> str:
    """
    Extract plain text from OpenRouter response.
    Gemma returns content as a STRING (not list).
    """
    print("[OpenRouter] Extracting response content")

    if isinstance(content, str):
        print(f"[OpenRouter] Extracted text: {content[:200]}")
        return content.strip()

    print("[OpenRouter] Unsupported content format:", type(content))
    return ""


async def process_chat_request(message: str,image_url: Optional[str] = None,) -> str:
    """
    Send a TEXT-ONLY request to OpenRouter using Gemma 3.
    """

    print("[OpenRouter] ================================")
    print("[OpenRouter] Starting chat request")
    print(f"[OpenRouter] Model: {MODEL}")
    print(f"[OpenRouter] User message: {message}")
    print("[OpenRouter] ================================")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        # Optional but recommended
        # "HTTP-Referer": "http://localhost:3000",
        # "X-Title": "AI Integration Platform",
    }

    # 🚨 Gemma expects PLAIN STRING content
    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": message,
            }
        ],
    }

    print("[OpenRouter] Payload prepared")
    print(f"[OpenRouter] Payload preview: {payload}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            print("[OpenRouter] Sending request to OpenRouter...")
            response = await client.post(
                OPENROUTER_URL,
                json=payload,
                headers=headers,
            )

            print(f"[OpenRouter] HTTP status: {response.status_code}")
            response.raise_for_status()

            data = response.json()
            print("[OpenRouter] Response received")
            print(f"[OpenRouter] Raw response preview: {str(data)[:500]}")

            if "choices" not in data or not data["choices"]:
                print("[OpenRouter] No choices returned")
                return "I couldn't generate a response. Please try again."

            message_obj = data["choices"][0].get("message", {})
            content = message_obj.get("content")

            final_text = extract_text_from_content(content)

            if not final_text:
                print("[OpenRouter] Empty assistant response")
                return "I couldn't generate a response. Please try again."

            print("[OpenRouter] Final response extracted successfully")
            return final_text

        except httpx.HTTPStatusError as e:
            print(
                "[OpenRouter] HTTP ERROR",
                e.response.status_code,
                e.response.text[:500],
            )
            return "The AI service is temporarily unavailable."

        except httpx.RequestError as e:
            print("[OpenRouter] NETWORK ERROR", str(e))
            return "Network error while contacting AI service."

        except Exception as e:
            print("[OpenRouter] UNEXPECTED ERROR", str(e))
            return "An unexpected error occurred."
