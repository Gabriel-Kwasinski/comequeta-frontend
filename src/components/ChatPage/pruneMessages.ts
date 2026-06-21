/**
 * Pure message-cache pruning (SCRUM-21) — no Capacitor/network imports.
 *
 * Isolated here so the on-device storage size policy can be unit-tested
 * without booting the backend or loading native plugins.
 */

export interface Message {
  id: number
  sender_id: number
  recipient_id: number
  content: string
  created_at: string
  read_at: string | null
}

/** Maximum number of cached messages retained per conversation. */
export const MESSAGE_CACHE_CAP = 100

/**
 * Keep only the most recent `cap` messages.
 *
 * Messages are sorted ascending by `created_at` (oldest first) and the newest
 * tail is retained, so the cache always represents the latest slice of the
 * conversation and on-device storage stays bounded.
 */
export function pruneMessages(
  messages: Message[],
  cap = MESSAGE_CACHE_CAP,
): Message[] {
  if (cap <= 0) return []
  const sorted = [...messages].sort((a, b) =>
    a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0,
  )
  return sorted.length > cap ? sorted.slice(sorted.length - cap) : sorted
}
