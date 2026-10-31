"""WellMind AI - retrieval and provider-independent prompt construction.

Loads the persisted FAISS index and metadata, retrieves the most
similar CounselChat Q&A pairs for a query, and builds a RAG prompt.
No LLM inference happens here - this module only prepares context.
"""
import json
import os

import faiss
import numpy as np

import config


class RetrievalError(RuntimeError):
    """Raised when the FAISS index or metadata is unavailable."""


class RagEngine:
    """Local RAG retrieval over the CounselChat dataset."""

    def __init__(
        self,
        index_path: str = None,
        metadata_path: str = None,
        model_name: str = config.EMBEDDING_MODEL_NAME,
        top_k: int = config.RAG_TOP_K,
    ):
        self.model_name = model_name
        self.top_k = top_k
        self.index_path = index_path or os.path.join(
            config.INDEX_DIR, "counselchat.index"
        )
        self.metadata_path = metadata_path or os.path.join(
            config.INDEX_DIR, "metadata.json"
        )
        self._model = None
        self._index = None
        self._metadata = None

    # -- lazy loaders -----------------------------------------------------
    @property
    def model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
        return self._model

    @property
    def index(self):
        if self._index is None:
            if not os.path.exists(self.index_path):
                raise RetrievalError(
                    "FAISS index not found. Run: python3 preprocess.py"
                )
            self._index = faiss.read_index(self.index_path)
        return self._index

    @property
    def metadata(self):
        if self._metadata is None:
            if not os.path.exists(self.metadata_path):
                raise RetrievalError(
                    "Metadata not found. Run: python3 preprocess.py"
                )
            with open(self.metadata_path, encoding="utf-8") as f:
                self._metadata = json.load(f)
        return self._metadata

    # -- core operations --------------------------------------------------
    def retrieve(self, query: str, top_k: int = None):
        """Return top_k most similar records as (score, record) tuples."""
        k = top_k or self.top_k
        if not isinstance(query, str) or not query.strip():
            return []

        vector = self.model.encode([query], convert_to_numpy=True)
        vector = vector.astype("float32")
        faiss.normalize_L2(vector)

        scores, indices = self.index.search(vector, min(k, self.index.ntotal))
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            results.append((float(score), self.metadata[int(idx)]))
        return results

    def build_prompt(self, query: str, results=None):
        """Build a provider-agnostic RAG prompt from retrieved context."""
        results = results if results is not None else self.retrieve(query)
        if not results:
            context = "(No relevant reference material found.)"
        else:
            parts = []
            for score, record in results:
                parts.append(
                    f"Q: {record['question']}\nA: {record['answer']}"
                )
            context = "\n\n---\n\n".join(parts)

        prompt = (
            "You are a compassionate mental wellness support assistant. "
            "Use the following reference material from past counseling "
            "conversations to inform your response. The reference material "
            "is informational only and is not a substitute for professional "
            "care.\n\n"
            f"Reference material:\n{context}\n\n"
            "Guidelines:\n"
            "- Respond with empathy and practical, non-diagnostic support.\n"
            "- Do not diagnose conditions or prescribe medication.\n"
            "- If the user may be in crisis, prioritize safety guidance.\n"
            "- Suggest reaching out to a licensed professional when appropriate.\n"
            "- Continue the conversation naturally. Treat the reference material as optional background and ignore any of it that does not match what the person is talking about.\n"
            "- Tone: warm, calm and quietly hopeful. Reassure the person that what they feel is understandable and can ease. Never use alarming or clinical language.\n"
            "- Structure: (1) one or two sentences that validate their feeling, (2) a blank line, then up to three short steps they can try right now, each on its own line starting with '- ', (3) a blank line, then one gentle, encouraging question.\n"
            "- Keep the whole reply under 120 words, plain text only, no markdown headings, tables or bold.\n\n"
            f"User: {query}\nAssistant:"
        )
        return prompt


def main():
    """CLI: retrieve and print results for a test query."""
    import sys
    query = sys.argv[1] if len(sys.argv) > 1 else "I feel anxious"
    engine = RagEngine()
    results = engine.retrieve(query)
    print(f"Query: {query}")
    print(f"Results: {len(results)}")
    for score, record in results:
        print(f"  score={score:.4f} topic={record.get('topics', '')}")
        print(f"  Q: {record['question'][:80]}")
    print("\nPrompt preview:")
    print(engine.build_prompt(query)[:400])


if __name__ == "__main__":
    main()
