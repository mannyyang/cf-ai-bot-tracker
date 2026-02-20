import type { GeoData } from './types'

/**
 * Extract geo data from Cloudflare's IncomingRequestCfProperties and headers.
 * Used in Tail Worker mode where cf properties come from TailItem.event.request.cf
 */
export function enrichFromCf(
  cf: Record<string, unknown> | undefined,
  headers: Record<string, string>
): GeoData {
  return {
    ip: headers['cf-connecting-ip'],
    country: cf?.country as string | undefined,
    city: cf?.city as string | undefined,
    region: cf?.region as string | undefined,
    requestId: headers['cf-ray'],
  }
}

/**
 * Extract geo data from a live Request object.
 * Used in pass-through mode where request.cf is available directly.
 */
export function enrichFromRequest(request: Request): GeoData {
  const cf = (request as Request & { cf?: Record<string, unknown> }).cf
  return {
    ip: request.headers.get('cf-connecting-ip') ?? undefined,
    country: cf?.country as string | undefined,
    city: cf?.city as string | undefined,
    region: cf?.region as string | undefined,
    requestId: request.headers.get('cf-ray') ?? undefined,
  }
}
