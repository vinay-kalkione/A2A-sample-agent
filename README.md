# Sample Express + LangChain app

Minimal Express server with LangChain (OpenAI) for chat and streaming.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your OpenAI API key:

   ```bash
   cp env.example .env
   # Edit .env and set OPENAI_API_KEY=sk-...
   ```

3. Run the server:

   ```bash
   npm start
   ```

   Or with auto-reload:

   ```bash
   npm run dev
   ```

## Endpoints

- **GET /health** – Health check.
- **POST /chat** – One-shot chat. Body: `{ "message": "Your question" }`. Returns `{ "reply": "..." }`.

## Example

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2 + 2?"}'
```
