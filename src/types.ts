export type EventType = 'click' | 'crawler' | 'agent'

export interface DetectionResult {
  /** Canonical source name, e.g. 'chatgpt', 'openai-gptbot', 'anthropic-claudebot' */
  source: string
  /** How the AI system was detected */
  type: EventType
}

export interface AiBotEvent {
  host?: string
  path: string
  source: string
  type: EventType
  ip?: string
  country?: string
  city?: string
  region?: string
  userAgent?: string
  referer?: string
  requestId?: string
}

export interface GeoData {
  ip?: string
  country?: string
  city?: string
  region?: string
  requestId?: string
}

export interface Env {
  AI_TRACKER_DB: D1Database
}
