"""WellMind AI - configuration.

Phase 2: reads settings from environment variables only.
No hardcoded secrets, no API keys, no credentials.
"""
import os


def _load_dotenv(path):
    """Load KEY=VALUE lines from a local .env without overriding real env vars."""
    try:
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip("\"'"))
    except FileNotFoundError:
        pass


_load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Express backend base URL (for service-to-service health checks)
EXPRESS_BASE_URL = os.getenv("EXPRESS_BASE_URL", "http://localhost:5002")

# AI service port
AI_SERVICE_PORT = int(os.getenv("AI_SERVICE_PORT", "5001"))

# Dataset path (read-only source of truth)
DATASET_PATH = os.getenv(
    "DATASET_PATH",
    os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..",
        "WellMind-Mental-Health-Support-Chatbot-main",
        "counselchat-data.csv",
    ),
)

# Embedding model (from notebook: all-MiniLM-L6-v2). NOT downloaded yet.
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")

# LLM provider configuration (free-quota providers only).
# Supported values: "hf" (Hugging Face Inference API), "together", "groq".
# Must be set via environment. Defaults to empty so the service starts in a
# clearly disabled state rather than silently using an unapproved provider.
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "")
LLM_MODEL = os.getenv("LLM_MODEL", "")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")  # never printed, never logged

# RAG settings (from notebook: top_k=3 retrieval, top-5 context injection)
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "3"))
RAG_CONTEXT_PAIRS = int(os.getenv("RAG_CONTEXT_PAIRS", "5"))

# Persisted FAISS index + metadata directory (gitignored)
INDEX_DIR = os.getenv("INDEX_DIR", os.path.join(os.path.dirname(__file__), "index"))

# Optional override of the provider's OpenAI-compatible base URL.
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "")
LLM_TIMEOUT_SECONDS = int(os.getenv("LLM_TIMEOUT_SECONDS", "20"))
