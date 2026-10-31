"""WellMind AI - Python AI service.

Phase 3B Step 1: RAG foundation with counseling reference retrieval
and mental-wellness safety handling. No LLM inference is configured yet.

Endpoints:
  GET  /health  -> service status (index health, provider status)
  POST /chat    -> validated message -> safety check -> RAG retrieval -> safe response
"""
import time

from flask import Flask, request, jsonify
from flask_cors import CORS

import config
import llm
import rag
import safety


app = Flask(__name__)
CORS(app)

_rag_engine = None


def rag_engine():
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = rag.RagEngine()
    return _rag_engine


@app.get("/health")
def health():
    try:
        engine = rag_engine()
        engine.index  # loads the FAISS index; no embedding work per health check
        status = "ready"
        docs = engine.index.ntotal if hasattr(engine.index, "ntotal") else 0
    except rag.RetrievalError as exc:
        status = "no_index"
        docs = 0
    except Exception:
        status = "unavailable"
        docs = 0

    return jsonify({
        "status": "ok",
        "service": "wellmind-ai",
        "rag": status,
        "documents": docs,
        "embedding_model": config.EMBEDDING_MODEL_NAME,
        "llm_provider": config.LLM_PROVIDER or "not-configured",
        "llm_inference": llm.is_configured(),
    })


@app.post("/chat")
def chat():
    # 1. Validate input
    raw = request.get_json(silent=True) or {}
    message = raw.get("message", "")
    is_valid, err = safety.validate_message(message)
    if not is_valid:
        return jsonify({"error": err}), 400

    message = safety.sanitize(message)
    history = safety.clean_history(raw.get("history"))

    # 2. Safety check: crisis takes precedence over retrieval
    crisis_result = safety.detect_crisis(message)
    if crisis_result.is_crisis:
        return jsonify({
            "response": crisis_result.message,
            "provider": "safety",
            "is_safety_response": True,
            "generation_configured": bool(config.LLM_PROVIDER),
        })

    # 3. RAG retrieval
    try:
        # A short follow-up ("what about the second one?") has no topic of its own,
        # so retrieve against the previous user turn as well.
        previous_user = next((m["content"] for m in reversed(history) if m["role"] == "user"), "")
        query = f"{previous_user} {message}".strip() if previous_user and len(message.split()) < 8 else message
        results = rag_engine().retrieve(query, top_k=config.RAG_TOP_K)
    except rag.RetrievalError as exc:
        return jsonify({
            "error": "Reference service unavailable: " + str(exc),
            "is_safety_response": False,
        }), 503

    # 4. Safety disclaimer (present on every response, never hidden)
    disclaimer = safety.SUPPORT_DISCLAIMER

    # 5. Generate a safe response. Without a configured LLM, say so honestly
    #    rather than fabricating a counseling answer.
    if not llm.is_configured():
        return jsonify({
            "response": (
                "Thanks for sharing. I retrieved "
                f"{len(results)} related counseling reference"
                f"{'' if len(results) == 1 else 's'}, but generative AI "
                "inference is not configured on this server, so I cannot "
                "compose a personalized reply. This is not a generated "
                "counseling answer. If you need support now, please contact "
                "a trusted person or local emergency / crisis services."
            ),
            "provider": "retrieval-only",
            "is_safety_response": False,
            "retrieved": len(results),
            "generation_configured": False,
        })

    try:
        reply = llm.generate(rag_engine().build_prompt(message, results), message, history)
    except llm.LLMError:
        return jsonify({
            "error": "The language model is temporarily unavailable.",
            "is_safety_response": False,
        }), 503

    return jsonify({
        "response": f"{reply}\n\n{disclaimer}",
        "provider": config.LLM_PROVIDER,
        "is_safety_response": False,
        "retrieved": len(results),
        "generation_configured": True,
    })


@app.get("/ready")
def ready():
    """Readiness probe: fails if the FAISS index cannot be loaded."""
    try:
        engine = rag_engine()
        return jsonify({"ready": True, "documents": engine.index.ntotal})
    except rag.RetrievalError as exc:
        return jsonify({"ready": False, "error": str(exc)}), 503


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=config.AI_SERVICE_PORT)
