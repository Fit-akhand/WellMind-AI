"""Focused tests for RAG, safety, and app endpoints.

Uses only Python built-ins (unittest) - no external test framework.
Run: python3 tests/test_rag.py
"""
import json
import os
import sys
import tempfile
import unittest

# Ensure the service directory is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app as app_module
import config
import preprocess
import rag
import safety


class TestSafety(unittest.TestCase):
    def test_clean_message_passes(self):
        valid, err = safety.validate_message("I feel anxious today")
        self.assertTrue(valid)
        self.assertEqual(err, "")

    def test_empty_message_rejected(self):
        valid, err = safety.validate_message("   ")
        self.assertFalse(valid)
        self.assertNotEqual(err, "")

    def test_non_string_rejected(self):
        valid, err = safety.validate_message(123)
        self.assertFalse(valid)

    def test_long_message_rejected(self):
        valid, err = safety.validate_message("x" * (safety.MAX_MESSAGE_LENGTH + 1))
        self.assertFalse(valid)
        self.assertNotEqual(err, "")

    def test_crisis_detection(self):
        result = safety.detect_crisis("I am thinking about suicide")
        self.assertTrue(result.is_crisis)
        self.assertIn("988", result.message)
        self.assertIn("14416", result.message)
        self.assertIn("1800-599-0019", result.message)
        self.assertNotRegex(result.message, r"1800-599-001(?!\d)")

    def test_non_crisis_not_flagged(self):
        result = safety.detect_crisis("I feel anxious about a test")
        self.assertFalse(result.is_crisis)

    def test_crisis_resources_included(self):
        response = safety.build_crisis_response()
        for line in safety.CRISIS_RESOURCES:
            self.assertIn(line.split(" (")[0], response)

    def test_sanitize_whitespace(self):
        self.assertEqual(safety.sanitize("  a \n\n b  "), "a b")


class TestPreprocess(unittest.TestCase):
    def test_clean_text_strips_html(self):
        cleaned = preprocess.clean_text("<p>Hello &amp; welcome</p>")
        self.assertEqual(cleaned, "Hello & welcome")

    def test_clean_text_handles_none(self):
        self.assertEqual(preprocess.clean_text(None), "")

    def test_load_dataset(self):
        records = preprocess.load_dataset(config.DATASET_PATH)
        self.assertGreater(len(records), 1000)
        self.assertIn("answer", records[0])
        self.assertIn("question", records[0])


class TestRag(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Build a small in-memory index from a few synthetic records
        cls.records = [
            {"questionID": "1", "question": "how do i deal with anxiety",
             "answer": "Try deep breathing.", "topics": "Anxiety"},
            {"questionID": "2", "question": "i feel very sad and hopeless",
             "answer": "Reach out to someone you trust.", "topics": "Depression"},
            {"questionID": "3", "question": "my partner and i argue a lot",
             "answer": "Practice active listening.", "topics": "Relationships"},
        ]
        cls.tmpdir = tempfile.mkdtemp()
        cls.index_path = os.path.join(cls.tmpdir, "test.index")
        cls.metadata_path = os.path.join(cls.tmpdir, "test.metadata.json")

        import faiss
        import numpy as np
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer(config.EMBEDDING_MODEL_NAME)
        vectors = model.encode(
            [r["question"] for r in cls.records], convert_to_numpy=True
        ).astype("float32")
        faiss.normalize_L2(vectors)
        index = faiss.IndexFlatIP(vectors.shape[1])
        index.add(vectors)
        faiss.write_index(index, cls.index_path)
        with open(cls.metadata_path, "w", encoding="utf-8") as f:
            json.dump(cls.records, f)

    def test_retrieve_returns_results(self):
        engine = rag.RagEngine(
            index_path=self.index_path,
            metadata_path=self.metadata_path,
        )
        results = engine.retrieve("anxiety help")
        self.assertGreater(len(results), 0)
        self.assertGreaterEqual(results[0][0], 0.0)

    def test_retrieve_empty_query(self):
        engine = rag.RagEngine(
            index_path=self.index_path,
            metadata_path=self.metadata_path,
        )
        self.assertEqual(engine.retrieve("   "), [])

    def test_retrieve_missing_index_raises(self):
        engine = rag.RagEngine(
            index_path="/nonexistent/path.index",
            metadata_path="/nonexistent/path.json",
        )
        with self.assertRaises(rag.RetrievalError):
            engine.retrieve("test")

    def test_build_prompt(self):
        engine = rag.RagEngine(
            index_path=self.index_path,
            metadata_path=self.metadata_path,
        )
        prompt = engine.build_prompt("I feel anxious")
        self.assertIn("Reference material:", prompt)
        self.assertIn("User: I feel anxious", prompt)
        self.assertIn("not a substitute for professional care", prompt)


class TestAppEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = app_module.app.test_client()

    def test_health(self):
        res = self.app.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("status", data)

    def test_ready_endpoint_exists(self):
        res = self.app.get("/ready")
        self.assertIn(res.status_code, (200, 503))
        data = res.get_json()
        self.assertIn("ready", data)

    def test_chat_missing_message(self):
        res = self.app.post("/chat", json={})
        self.assertEqual(res.status_code, 400)

    def test_chat_empty_message(self):
        res = self.app.post("/chat", json={"message": "   "})
        self.assertEqual(res.status_code, 400)

    def test_chat_crisis(self):
        res = self.app.post("/chat", json={"message": "I want to kill myself"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("is_safety_response"))
        self.assertIn("988", data.get("response", ""))

    def test_chat_without_provider(self):
        # LLM_PROVIDER is empty - response must be honest, not Echo.
        # Uses a temp index so the endpoint does not require the full
        # CounselChat index to be built.
        import tempfile
        import faiss
        import numpy as np
        from sentence_transformers import SentenceTransformer

        tmpdir = tempfile.mkdtemp()
        records = [
            {"questionID": "t1", "question": "how do i deal with anxiety",
             "answer": "Try deep breathing.", "topics": "Anxiety"},
        ]
        model = SentenceTransformer(config.EMBEDDING_MODEL_NAME)
        vectors = model.encode(
            [r["question"] for r in records], convert_to_numpy=True
        ).astype("float32")
        faiss.normalize_L2(vectors)
        index = faiss.IndexFlatIP(vectors.shape[1])
        index.add(vectors)
        faiss.write_index(index, os.path.join(tmpdir, "counselchat.index"))
        with open(os.path.join(tmpdir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(records, f)

        original_index_dir = config.INDEX_DIR
        config.INDEX_DIR = tmpdir
        app_module._rag_engine = None
        try:
            res = self.app.post("/chat", json={"message": "hello"})
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertNotIn("Echo:", data.get("response", ""))
            self.assertFalse(data.get("generation_configured"))
            self.assertIn("not configured", data.get("response", "").lower())
            self.assertEqual(data.get("provider"), "retrieval-only")
        finally:
            config.INDEX_DIR = original_index_dir
            app_module._rag_engine = None


if __name__ == "__main__":
    unittest.main(verbosity=2)
