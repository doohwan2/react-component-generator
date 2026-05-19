@AGENTS.md
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `bun run dev` — Start API server + Vite dev server concurrently. API runs on `http://localhost:3002`, frontend on `http://localhost:5173`.
- `bun run server` — Start only the Bun API server with auto-reload (`--watch`).
- `bun install` — Install dependencies using Bun.

### Building & Quality
- `bun run build` — Compile TypeScript and build with Vite for production.
- `bun run lint` — Run ESLint across the codebase.
- `bun run preview` — Preview the production build locally.

## Architecture

### Frontend (React + Vite)
Located in `src/`, the UI is a single-page app structured as:

1. **App.tsx** — Main component managing global state:
   - Selected AI provider (Anthropic or Google)
   - API key input and `.env` key detection
   - Component list display and management

2. **useComponentGenerator hook** (`src/hooks/useComponentGenerator.ts`) — State management for generated components:
   - Manages array of `GeneratedComponent` objects (id, prompt, code, createdAt)
   - Handles API calls to `/api/generate`
   - Tracks loading/error states

3. **Components** (`src/components/`):
   - `PromptInput.tsx` — Text input form for generation requests
   - `ComponentCard.tsx` — Card UI displaying generated component preview and code
   - `CodeView.tsx` — Code syntax highlighting
   - `LivePreview.tsx` — Runtime rendering using react-live

4. **Types** (`src/types/index.ts`) — `Provider` ('anthropic' | 'google'), `GeneratedComponent` interface

### Backend (Bun Server)
Located in `server/index.ts`, a lightweight API proxy server with two endpoints:

1. **GET `/api/config`** — Returns which API keys are set in `.env` (for UI to show "env key connected" status)
2. **POST `/api/generate`** — Accepts `{ prompt, apiKey?, provider }`, calls the appropriate AI provider, post-processes the response, returns `{ code }`

The server:
- Runs on port 3002
- Proxies requests to Anthropic Claude or Google Gemini APIs
- Strips markdown code fences and ensures a `render()` call is present
- Handles API errors (503, 429) with user-friendly messages

### Data Flow
1. User enters prompt in frontend, optionally selects provider and API key
2. Frontend calls `/api/generate` (POST) with prompt + provider
3. Server resolves API key (from client request or `.env`)
4. Server calls selected AI provider with `SYSTEM_PROMPT` (enforces inline styles, no imports, self-contained code)
5. Response is cleaned (code fences stripped, `render()` call added) and returned
6. Frontend receives code, creates `GeneratedComponent`, re-renders with react-live

## Key Technologies

- **React 19 + TypeScript** — UI framework
- **Vite** — Module bundler and dev server with fast HMR
- **Bun** — JavaScript runtime for backend (chosen for speed)
- **react-live** — Runtime JSX compilation and rendering for live preview
- **Anthropic Claude** and **Google Gemini** — AI providers for component generation
- **ESLint** — Code linting with React plugin

## Provider Integration

Both Anthropic and Google integrations follow the same pattern:

1. **API Key Source** — Priority order:
   - Client-provided key (UI input)
   - Environment variable (`.env`: `ANTHROPIC_API_KEY` or `GOOGLE_API_KEY`)
   
2. **Model Selection**:
   - Anthropic: `claude-haiku-4-5-20251001`
   - Google: `gemini-2.5-flash`

3. **System Prompt** — Defined in `server/index.ts` as `SYSTEM_PROMPT`. Specifies:
   - Inline styles only (no CSS modules)
   - Plain JavaScript (no TypeScript syntax)
   - `React.useState` / `React.useEffect` for hooks
   - Must include `render(<ComponentName />)` call
   - Self-contained, visually appealing components

## Development Notes

- **Vite proxy** (`vite.config.ts`) forwards `/api/*` requests to `http://localhost:3002` in dev
- **CORS headers** are added by server for cross-origin requests
- **Environment file** (`.env`) is read by server on startup; changes require server restart
- **Component code generation** assumes React is available globally in the sandbox (react-live handles this)
- When modifying the system prompt, test with multiple providers and verify the output works with react-live (no imports, plain JS)
