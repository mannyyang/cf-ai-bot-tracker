import { AI_REFERRERS, AI_BOTS, AGENT_HEADERS } from './patterns'
import type { DetectionResult } from './types'

/**
 * Detect whether a request originates from an AI system.
 *
 * Detection priority:
 * 1. Agent headers (e.g., ChatGPT's Signature-Agent for browser agent mode)
 * 2. Referrer (user clicked a link from an AI chat interface)
 * 3. User-Agent (AI crawler or real-time fetcher)
 */
export function detectAiBot(headers: {
  referer?: string | null
  userAgent?: string | null
  signatureAgent?: string | null
}): DetectionResult | null {
  // 1. Check agent-mode headers (e.g., ChatGPT agent browsing with Signature-Agent)
  if (headers.signatureAgent) {
    for (const { pattern, source } of AGENT_HEADERS) {
      if (headers.signatureAgent.includes(pattern)) {
        return { source, type: 'agent' }
      }
    }
  }

  // 2. Check referrer (user clicked from an AI chat interface)
  if (headers.referer) {
    for (const [domain, source] of Object.entries(AI_REFERRERS)) {
      if (headers.referer.includes(domain)) {
        return { source, type: 'click' }
      }
    }
  }

  // 3. Check user-agent (AI crawler or fetcher) — case-insensitive
  if (headers.userAgent) {
    const ua = headers.userAgent.toLowerCase()
    for (const [pattern, source] of Object.entries(AI_BOTS)) {
      if (ua.includes(pattern)) {
        return { source, type: 'crawler' }
      }
    }
  }

  return null
}
