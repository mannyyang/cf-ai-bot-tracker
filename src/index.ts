import { detectAiBot } from './detector'
import { enrichFromCf, enrichFromRequest } from './enrichment'
import { writeEvent, writeEvents } from './storage'
import type { AiBotEvent, Env } from './types'

export default {
  /**
   * Tail Worker handler (primary mode).
   *
   * Receives execution traces from a producer Worker. Inspects each request
   * for AI bot signals and writes detected events to D1.
   *
   * To use: add [[tail_consumers]] service = "cf-ai-bot-tracker" to your site's wrangler.toml
   */
  async tail(
    events: TraceItem[],
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const detected: AiBotEvent[] = []

    for (const event of events) {
      // Only process fetch events (skip scheduled, queue, etc.)
      const info = event.event
      if (!info || !('request' in info)) continue

      const req = (info as TraceItemFetchEventInfo).request
      const headers = req.headers

      const detection = detectAiBot({
        referer: headers['referer'],
        userAgent: headers['user-agent'],
        signatureAgent: headers['signature-agent'],
      })

      if (detection) {
        const geo = enrichFromCf(
          req.cf as Record<string, unknown> | undefined,
          headers
        )

        const parsedUrl = new URL(req.url)
        detected.push({
          host: parsedUrl.hostname,
          path: parsedUrl.pathname,
          source: detection.source,
          type: detection.type,
          userAgent: headers['user-agent'],
          referer: headers['referer'],
          ...geo,
        })
      }
    }

    if (detected.length > 0) {
      ctx.waitUntil(writeEvents(env.AI_TRACKER_DB, detected))
    }
  },

  /**
   * Fetch handler (pass-through mode).
   *
   * For users without an existing Worker. Binds to a route, detects AI bots,
   * logs events via waitUntil, and passes the request through to the origin.
   *
   * To use: add [[routes]] pattern = "example.com/*" to wrangler.toml
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const detection = detectAiBot({
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      signatureAgent: request.headers.get('signature-agent'),
    })

    if (detection) {
      // For click events, only track actual page navigations.
      // Internal fetch/API calls inherit the AI referrer but aren't real visits.
      const secFetchMode = request.headers.get('sec-fetch-mode')
      const shouldTrack =
        detection.type !== 'click' || secFetchMode === 'navigate'

      if (shouldTrack) {
        const geo = enrichFromRequest(request)
        const { hostname, pathname } = new URL(request.url)
        ctx.waitUntil(
          writeEvent(env.AI_TRACKER_DB, {
            host: hostname,
            path: pathname,
            source: detection.source,
            type: detection.type,
            userAgent: request.headers.get('user-agent') ?? undefined,
            referer: request.headers.get('referer') ?? undefined,
            ...geo,
          })
        )
      }
    }

    // Pass through to origin
    return fetch(request)
  },
}
