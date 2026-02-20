/**
 * Default AI bot detection patterns.
 *
 * Referrer domains: detect clicks from AI chat interfaces.
 * Bot user-agents: detect AI crawlers and fetchers (patterns are lowercase for case-insensitive matching).
 * Agent headers: detect AI agent browsing modes (e.g., ChatGPT's Signature-Agent).
 */

/** Maps referrer domain substrings to canonical source names */
export const AI_REFERRERS: Record<string, string> = {
  // OpenAI
  'chatgpt.com': 'chatgpt',
  'chat.openai.com': 'chatgpt',
  // Perplexity
  'perplexity.ai': 'perplexity',
  // Anthropic
  'claude.ai': 'claude',
  // Google
  'gemini.google.com': 'gemini',
  'bard.google.com': 'google-bard',
  // Microsoft
  'copilot.microsoft.com': 'microsoft-copilot',
  'bing.com/chat': 'bing-chat',
  // Meta
  'meta.ai': 'meta-ai',
  // Others
  'you.com': 'you',
  'phind.com': 'phind',
  'poe.com': 'poe',
  'huggingface.co': 'huggingface',
}

/** Maps user-agent substrings (lowercase) to canonical source names */
export const AI_BOTS: Record<string, string> = {
  // OpenAI
  'gptbot': 'openai-gptbot',
  'chatgpt-user': 'openai-chatgpt-user',
  'oai-searchbot': 'openai-searchbot',
  // Perplexity
  'perplexitybot': 'perplexity-bot',
  'perplexity-user': 'perplexity-user',
  // Anthropic
  'claudebot': 'anthropic-claudebot',
  'claude-user': 'anthropic-claude-user',
  'claude-searchbot': 'anthropic-searchbot',
  'anthropic-ai': 'anthropic-ai',
  // Google
  'google-extended': 'google-extended',
  // Microsoft/Bing
  'bingbot': 'microsoft-bingbot',
  'bingpreview': 'microsoft-bingpreview',
  // Meta
  'facebookbot': 'meta-facebookbot',
  'meta-externalagent': 'meta-externalagent',
  'facebookexternalhit': 'meta-facebookhit',
  // Apple
  'applebot': 'apple-applebot',
  // Brave
  'bravesearch': 'brave-search',
  // Cohere
  'cohere-ai': 'cohere-ai',
  // Mistral
  'mistralbot': 'mistral-bot',
  // General crawlers
  'amazonbot': 'amazon-bot',
  'bytespider': 'bytedance',
  'ccbot': 'common-crawl',
  'ia_archiver': 'internet-archive',
  'yandexbot': 'yandex-bot',
}

/** Agent header patterns (e.g., ChatGPT's Signature-Agent for agent browsing mode) */
export const AGENT_HEADERS: Array<{
  header: string
  pattern: string
  source: string
}> = [
  { header: 'signature-agent', pattern: 'chatgpt.com', source: 'chatgpt-agent' },
]
