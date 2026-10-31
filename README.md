# WellMind

A mental-wellness web app: mood tracking, surveys, wellness activities and a
retrieval-backed support chat with crisis safety handling.

```
React (Vite :5173) -> Express API (:5002) -> Flask AI service (:5001)
                            |
                         MongoDB
```

## Run it

1. **AI service** (Python 3.9+): `cd WellMind-AI-service && pip install -r requirements.txt && python3 app.py`
2. **API** (Node 18+): `cd WellMind-Server && npm install && npm start`
   Needs `WellMind-Server/.env` with `MONGO_URI`, `JWT_SECRET`, `PORT=5002`.
3. **Frontend**: `npm install && npm run dev`, then open http://localhost:5173

## Enable generated replies

Without an LLM the chat returns retrieved references and says so. To enable
generation, export these before starting the AI service:

```
LLM_PROVIDER=groq        # groq | together | hf
LLM_MODEL=<model id from the provider>
LLM_API_KEY=<your key>
```

## Tests

`npm test` (frontend), `cd WellMind-Server && npm test`, `cd WellMind-AI-service && python3 -m pytest tests`.
