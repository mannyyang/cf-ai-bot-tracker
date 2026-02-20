# cf-ai-bot-tracker

Open-source Cloudflare Worker that detects and logs AI bot visits to your website. Tracks 30+ AI crawlers, clicks from AI chat interfaces, and ChatGPT agent mode — all stored in Cloudflare D1.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/datagum/cf-ai-bot-tracker)

## Quick start

### 1. Deploy the tracker

Click the **Deploy to Cloudflare** button above. This automatically:
- Forks the repo to your GitHub
- Creates a D1 database
- Runs migrations
- Deploys the Worker

### 2. Connect to your site

Add this to your **site's** `wrangler.toml`:

```toml
[[tail_consumers]]
service = "cf-ai-bot-tracker"
```

Redeploy your site. Done.

## What it tracks

| Type | Description | Examples |
|------|-------------|----------|
| **Crawler** | AI bots identified by user-agent | GPTBot, ClaudeBot, PerplexityBot, GoogleBot, BingBot |
| **Click** | Users clicking links from AI chat interfaces | ChatGPT, Claude, Perplexity, Gemini, Copilot |
| **Agent** | AI agents browsing in real browser mode | ChatGPT agent mode (Signature-Agent header) |

## How it works

The tracker runs as a [Tail Worker](https://developers.cloudflare.com/workers/observability/logs/tail-workers/) — it receives request metadata *after* your site responds. Zero latency impact, can't break your site.

For each request, it checks:
1. **Signature-Agent header** — ChatGPT agent browsing mode
2. **Referer** — clicks from AI chat interfaces (chatgpt.com, claude.ai, perplexity.ai, etc.)
3. **User-Agent** — AI crawlers and fetchers (GPTBot, ClaudeBot, etc.)

Detected events are written to D1 with geo data (country, city, region) from Cloudflare.

## Querying events

Use the [D1 console](https://dash.cloudflare.com/?to=/:account/d1) in the Cloudflare dashboard, or `wrangler`:

```bash
# Recent events
pnpm db:query "SELECT * FROM ai_bot_events ORDER BY created_at DESC LIMIT 20"

# Events by source
pnpm db:query "SELECT source, count(*) as count FROM ai_bot_events GROUP BY source ORDER BY count DESC"

# Events by type
pnpm db:query "SELECT type, count(*) as count FROM ai_bot_events GROUP BY type"

# Events by country
pnpm db:query "SELECT country, count(*) as count FROM ai_bot_events GROUP BY country ORDER BY count DESC LIMIT 10"
```

## Event schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Auto-generated UUID |
| `path` | TEXT | URL path visited |
| `source` | TEXT | Canonical source (e.g., `openai-gptbot`, `chatgpt`, `perplexity-bot`) |
| `type` | TEXT | `click`, `crawler`, or `agent` |
| `ip` | TEXT | Visitor IP |
| `country` | TEXT | ISO country code |
| `city` | TEXT | City name |
| `region` | TEXT | State/region |
| `user_agent` | TEXT | Full user-agent string |
| `referer` | TEXT | HTTP referer |
| `request_id` | TEXT | Cloudflare Ray ID |
| `created_at` | TEXT | ISO 8601 timestamp |

## Detected sources

### Crawlers (30+ user-agent patterns)

| Pattern | Source | Company |
|---------|--------|---------|
| `gptbot` | openai-gptbot | OpenAI |
| `chatgpt-user` | openai-chatgpt-user | OpenAI |
| `oai-searchbot` | openai-searchbot | OpenAI |
| `perplexitybot` | perplexity-bot | Perplexity |
| `claudebot` | anthropic-claudebot | Anthropic |
| `claude-web` | anthropic-claude-web | Anthropic |
| `claude-searchbot` | anthropic-searchbot | Anthropic |
| `googlebot` | google-bot | Google |
| `google-extended` | google-extended | Google |
| `bingbot` | microsoft-bingbot | Microsoft |
| `facebookbot` | meta-facebookbot | Meta |
| `applebot` | apple-applebot | Apple |
| `bytespider` | bytedance | ByteDance |
| ... and more | | |

### Clicks (13 referrer domains)

| Domain | Source |
|--------|--------|
| chatgpt.com | chatgpt |
| perplexity.ai | perplexity |
| claude.ai | claude |
| gemini.google.com | gemini |
| copilot.microsoft.com | microsoft-copilot |
| meta.ai | meta-ai |
| you.com | you |
| phind.com | phind |
| poe.com | poe |

### Agent mode

| Header | Source |
|--------|--------|
| Signature-Agent: chatgpt.com | chatgpt-agent |

## Alternative: Pass-through mode

If you don't have an existing Worker (or are on the free plan), you can run the tracker as a pass-through Worker that sits in front of your origin:

1. Deploy using the button above (or clone and `pnpm deploy`)
2. Add routes to the tracker's `wrangler.toml`:

```toml
[[routes]]
pattern = "example.com/*"
zone_name = "example.com"
```

3. Redeploy: `pnpm deploy`

## Manual setup

If you prefer not to use the deploy button:

```bash
git clone https://github.com/datagum/cf-ai-bot-tracker.git
cd cf-ai-bot-tracker
pnpm install
pnpm deploy    # creates D1, runs migrations, deploys
```

Then add `[[tail_consumers]]` to your site's `wrangler.toml` as shown above.

## Local development

```bash
pnpm dev                  # Start local dev server
pnpm db:migrate:local     # Run migrations on local D1

# Test detection
curl -H "User-Agent: GPTBot/1.0" http://localhost:8787/some-page

# Check events
pnpm db:query "SELECT * FROM ai_bot_events" -- --local
```

## Requirements

- Cloudflare account
- Workers Paid plan (for Tail Worker mode) or Free plan (for pass-through mode)

## License

MIT
