import type { AiBotEvent } from './types'

/**
 * Write a single AI bot event to D1.
 */
export async function writeEvent(
  db: D1Database,
  event: AiBotEvent
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO ai_bot_events (host, path, source, type, ip, country, city, region, user_agent, referer, request_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      event.host ?? null,
      event.path,
      event.source,
      event.type,
      event.ip ?? null,
      event.country ?? null,
      event.city ?? null,
      event.region ?? null,
      event.userAgent ?? null,
      event.referer ?? null,
      event.requestId ?? null
    )
    .run()
}

/**
 * Write multiple AI bot events to D1 in a batch.
 */
export async function writeEvents(
  db: D1Database,
  events: AiBotEvent[]
): Promise<void> {
  if (events.length === 0) return

  const stmt = db.prepare(
    `INSERT INTO ai_bot_events (host, path, source, type, ip, country, city, region, user_agent, referer, request_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )

  await db.batch(
    events.map((event) =>
      stmt.bind(
        event.host ?? null,
        event.path,
        event.source,
        event.type,
        event.ip ?? null,
        event.country ?? null,
        event.city ?? null,
        event.region ?? null,
        event.userAgent ?? null,
        event.referer ?? null,
        event.requestId ?? null
      )
    )
  )
}
