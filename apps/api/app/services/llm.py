import httpx
from typing import Any, Optional
from app.core.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = settings.OPENROUTER_MODEL


def _decode_error_body(content: bytes) -> str:
    """Return a short, log-safe preview of an HTTP error body."""
    return content.decode("utf-8", errors="replace")[:500]


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


async def process_chat_request(message: str, previous_messages: Optional[list[dict]] = None) -> str:
    """
    Send a TEXT-ONLY request to OpenRouter using Gemma 3 with context.
    previous_messages: list of dicts with 'role' and 'content' keys.
    """

    print("[OpenRouter] ================================")
    print("[OpenRouter] Starting chat request")
    print(f"[OpenRouter] Model: {MODEL}")
    print(f"[OpenRouter] Context length: {len(previous_messages or [])}")
    print("[OpenRouter] ================================")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        # Optional but recommended
        # "HTTP-Referer": "http://localhost:3000",
        # "X-Title": "AI Integration Platform",
    }

    # Build messages array
    messages = [
        {"role": "system", "content": "You are a helpful AI assistant. Use the previous conversation for context."}
    ]
    
    # Add context
    messages.extend(previous_messages or [])
    
    # Add current message
    messages.append({"role": "user", "content": message})

    # 🚨 Gemma expects PLAIN STRING content
    payload = {
        "model": MODEL,
        "messages": messages,
    }

    print("[OpenRouter] Payload prepared")
    # print(f"[OpenRouter] Payload preview: {payload}") # Debug logging if needed

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


async def process_chat_request_stream(message: str, previous_messages: Optional[list[dict]] = None):
    """
    Stream a TEXT-ONLY request to OpenRouter using Gemma 3.
    Yields text chunks as they arrive.
    """
    print("[OpenRouter] ================================")
    print("[OpenRouter] Starting STREAMING chat request")
    print(f"[OpenRouter] Model: {MODEL}")
    print("[OpenRouter] ================================")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    messages = [
        {"role": "system", "content": "You are a helpful AI assistant. Use the previous conversation for context."}
    ]
    messages.extend(previous_messages or [])
    messages.append({"role": "user", "content": message})

    payload = {
        "model": MODEL,
        "messages": messages,
        "stream": True,  # Enable streaming
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            async with client.stream(
                "POST",
                OPENROUTER_URL,
                json=payload,
                headers=headers,
            ) as response:
                if response.is_error:
                    error_body = await response.aread()
                    print(
                        "[OpenRouter] STREAM HTTP ERROR",
                        response.status_code,
                        _decode_error_body(error_body),
                    )
                    yield "The AI service is temporarily unavailable."
                    return
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]  # Remove "data: " prefix
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            import json
                            data = json.loads(data_str)
                            if "choices" in data and data["choices"]:
                                delta = data["choices"][0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue

        except httpx.HTTPStatusError as e:
            error_body = await e.response.aread()
            print(
                "[OpenRouter] STREAM HTTP ERROR",
                e.response.status_code,
                _decode_error_body(error_body),
            )
            yield "The AI service is temporarily unavailable."

        except httpx.RequestError as e:
            print("[OpenRouter] STREAM NETWORK ERROR", str(e))
            yield "Network error while contacting AI service."

        except Exception as e:
            print("[OpenRouter] STREAM UNEXPECTED ERROR", str(e))
            yield "An unexpected error occurred."
