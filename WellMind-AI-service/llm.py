"""WellMind AI - LLM provider client.

Talks to OpenAI-compatible chat endpoints (Groq, Together, Hugging Face
router) using only the standard library. The API key comes from the
environment and is never logged.
"""
import json
import urllib.error
import urllib.request

import config

DEFAULT_BASE_URLS = {
    "groq": "https://api.groq.com/openai/v1",
    "together": "https://api.together.xyz/v1",
    "hf": "https://router.huggingface.co/v1",
}


class LLMError(Exception):
    pass


def is_configured() -> bool:
    return bool(config.LLM_PROVIDER and config.LLM_API_KEY and config.LLM_MODEL)


def generate(prompt: str, user_message: str, history=None) -> str:
    """Return the model's reply for a RAG prompt, or raise LLMError."""
    provider = config.LLM_PROVIDER
    base = (config.LLM_BASE_URL or DEFAULT_BASE_URLS.get(provider, "")).rstrip("/")
    if not base:
        raise LLMError(f"Unsupported LLM provider: {provider}")

    payload_extra = {"reasoning_effort": "low"} if "gpt-oss" in config.LLM_MODEL else {}
    body = json.dumps({
        **payload_extra,
        "model": config.LLM_MODEL,
        "messages": [
            {"role": "system", "content": prompt},
            *(history or []),
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.6,
        "max_tokens": 1200,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/chat/completions",
        data=body,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "WellMind-AI/1.0",
            "Authorization": f"Bearer {config.LLM_API_KEY}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=config.LLM_TIMEOUT_SECONDS) as res:
            data = json.loads(res.read().decode("utf-8"))
        text = data["choices"][0]["message"]["content"].strip()
    except (urllib.error.URLError, TimeoutError, KeyError, IndexError, ValueError) as exc:
        raise LLMError(type(exc).__name__) from exc
    if not text:
        raise LLMError("empty response")
    return text
