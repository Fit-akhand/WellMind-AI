"""WellMind AI - dataset preprocessing and FAISS index builder.

Reads the CounselChat CSV (read-only), cleans HTML/encoding artifacts,
embeds the question text with all-MiniLM-L6-v2, and persists:
  - FAISS index (IndexFlatIP with L2-normalized vectors)
  - document metadata JSON (question, answer, topics, questionID)

Run:  python3 preprocess.py
Output: ai_service/index/ (gitignored)
"""
import csv
import html
import json
import os
import re
import sys

# CounselChat contains long counseling answers; raise the CSV
# field-size limit so large rows are not silently rejected.
csv.field_size_limit(sys.maxsize)

import numpy as np

import config

# Matches any HTML tag; used to strip markup from dataset answers.
_HTML_TAG_RE = re.compile(r"<[^>]+>")
# Collapse runs of whitespace to a single space.
_WS_RE = re.compile(r"\s+")


def clean_text(raw: str) -> str:
    """Strip HTML tags, decode entities, and normalize whitespace."""
    if raw is None:
        return ""
    text = _HTML_TAG_RE.sub(" ", str(raw))
    text = html.unescape(text)
    text = _WS_RE.sub(" ", text).strip()
    return text


def load_dataset(path: str = config.DATASET_PATH):
    """Load and clean the CounselChat dataset. Returns list of dicts."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found: {path}")

    records = []
    with open(path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            question = clean_text(
                f"{row.get('questionTitle') or ''} {row.get('questionText') or ''}"
            )
            answer = clean_text(row.get("answerText") or "")
            # Skip rows with no usable answer text.
            if not answer:
                continue
            records.append({
                "questionID": (row.get("questionID") or "").strip(),
                "question": question,
                "answer": answer,
                "topics": (row.get("topics") or "").strip(),
            })
    return records


def build_index(records, model_name: str = config.EMBEDDING_MODEL_NAME):
    """Embed questions and build a normalized FAISS index."""
    from sentence_transformers import SentenceTransformer
    import faiss

    model = SentenceTransformer(model_name)
    questions = [r["question"] for r in records]
    vectors = model.encode(questions, convert_to_numpy=True, show_progress_bar=True)
    vectors = vectors.astype("float32")
    # L2-normalize so IndexFlatIP behaves like cosine similarity.
    faiss.normalize_L2(vectors)

    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)
    return index


def persist(index, records, index_dir: str = config.INDEX_DIR):
    """Write FAISS index and metadata JSON to disk."""
    os.makedirs(index_dir, exist_ok=True)
    import faiss
    faiss.write_index(index, os.path.join(index_dir, "counselchat.index"))
    with open(os.path.join(index_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False)
    return index_dir


def main():
    print(f"Dataset: {config.DATASET_PATH}")
    records = load_dataset()
    print(f"Cleaned records: {len(records)}")
    if not records:
        print("ERROR: no usable records in dataset", file=sys.stderr)
        sys.exit(1)

    print(f"Embedding with: {config.EMBEDDING_MODEL_NAME}")
    index = build_index(records)
    persist(index, records)
    print(f"Index persisted to: {config.INDEX_DIR}")
    print(f"Vectors: {index.ntotal}")


if __name__ == "__main__":
    main()
