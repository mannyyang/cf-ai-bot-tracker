# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use **pnpm** (not npm or yarn).

## Commands

```bash
pnpm dev                  # Local dev server (wrangler dev)
pnpm deploy               # Run D1 migrations + deploy Worker
pnpm db:migrate           # Apply D1 migrations (remote)
pnpm db:migrate:local     # Apply D1 migrations (local)
pnpm db:query "<SQL>"     # Query remote D1
pnpm db:query "<SQL>" -- --local  # Query local D1
pnpm type-check           # TypeScript type checking (tsc --noEmit)
```

No test framework is configured. No linter is configured.

## Architecture

Cloudflare Worker (Hono-free, uses native Workers API) that detects AI bot traffic and logs events to D1. It operates in two modes:

### Dual-mode entry point (`src/index.ts`)

- **Tail Worker mode** (`tail` handler): Receives `TraceItem[]` from a producer Worker *after* the response is sent. Zero latency impact on the site. Batch-writes detected events via `writeEvents`.
- **Pass-through mode** (`fetch` handler): Runs as a route-bound Worker in front of an origin. Detects bots, logs via `waitUntil`, then `fetch(request)` to origin. Filters click events to only `sec-fetch-mode: navigate` to avoid double-counting sub-resource requests.

### Detection pipeline

1. **`src/detector.ts`** — `detectAiBot()` checks three signal types in priority order:
   - `Signature-Agent` header → type `agent` (ChatGPT agent browsing)
   - `Referer` domain match → type `click` (user clicked from AI chat UI)
   - `User-Agent` substring match → type `crawler` (AI bot/fetcher)
2. **`src/patterns.ts`** — Three pattern tables: `AI_REFERRERS` (domain→source map), `AI_BOTS` (lowercase UA substring→source map), `AGENT_HEADERS` (header pattern array). All bot UA matching is case-insensitive (lowercased before comparison).
3. **`src/enrichment.ts`** — Two functions for extracting geo data: `enrichFromCf` (tail mode, reads from `TraceItem` cf properties + headers object) vs `enrichFromRequest` (pass-through mode, reads from live `Request.cf`).
4. **`src/storage.ts`** — `writeEvent` (single insert) and `writeEvents` (D1 batch) to the `ai_bot_events` table.
5. **`src/types.ts`** — Shared types: `EventType`, `DetectionResult`, `AiBotEvent`, `GeoData`, `Env`.

### D1 schema

Single table `ai_bot_events` with indexes on `source`, `type`, `created_at`, `country`. Migration in `migrations/0001_create_events.sql`. IDs are random hex blobs, timestamps are ISO 8601.

### Key design details

- The `Env` binding is `AI_TRACKER_DB` (D1Database) — must match `wrangler.toml` binding name.
- Tail mode receives headers as a plain `Record<string, string>` (not a `Headers` object), so access is via bracket notation. Pass-through mode uses `request.headers.get()`.
- Adding a new bot pattern only requires editing `src/patterns.ts` — no other files need changes.
