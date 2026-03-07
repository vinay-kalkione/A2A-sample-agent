# Dhruva Sample Audit Agent

A2A (Agent-to-Agent) agent for Dhruva Audit. Exposes health and chat endpoints.

## Setup

1. **Node**: Use Node.js >= 22.
2. **Install dependencies:**
  ```bash
   npm install
  ```
3. **Configure environment:** Copy `env.example` to `.env` and set your keys:
  ```bash
   cp env.example .env
  ```
   Edit `.env` and set at least:
  - `GEMINI_API_KEY` – Your Gemini API key
  - `AGENT_WALLET_PRIVATE_KEY` – Agent wallet private key
  - `AGENT_WALLET_PUBLIC_ADDRESS` – Agent wallet public address
   Optional for hosted deployment:
  - `BASE_URL` – Public base URL (e.g. `https://your-agent.example.com`)
  - `GRPC_URL` – gRPC endpoint (default: `localhost:4001` for local dev)
4. **Run the server:**
  ```bash
   npm run start
  ```
   Or with auto-reload:

   ```bash
   npm run dev
   ```

5. **Production build and run:**
   ```bash
   npm run build
   npm run start:prod
   ```
   This compiles TypeScript to `dist/` and runs the server with `node dist/index.js`.

- **GET /health** – Health check.
- **POST /chat** – One-shot chat. Body: `{ "message": "Your question" }`. Returns `{ "reply": "..." }`.

## Tools

The chat agent can call these tools (LangChain tools) when handling messages:


| Tool                                | Description                                                                                                                                                                                                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **get_agent_wallet_public_address** | Returns the agent wallet’s public address (from `AGENT_WALLET_PUBLIC_ADDRESS`). Use when the user or another agent needs to know the agent’s wallet address.                                                                                                            |
| **get_712_signature_for_challenge** | Signs a Dhruva audit challenge using EIP-712 and the agent’s wallet. **Input:** base64-encoded JSON challenge with `domain`, `types`, and `message` (EIP-712 typed data). **Output:** 0x-prefixed hex signature. Used for wallet verification in the Dhruva audit flow. |


Tool implementations live in `src/tools/`:

- `src/tools/agentwallet.ts` – wallet public address
- `src/tools/eip712.ts` – EIP-712 signing for the challenge

## Example

```bash
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2 + 2?"}'
```

