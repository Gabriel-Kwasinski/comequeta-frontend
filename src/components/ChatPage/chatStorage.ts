/**
 * On-device chat message cache (SCRUM-21).
 *
 * Messages are persisted per-peer with `@capacitor/preferences` so a thread can
 * be displayed instantly (and offline) before the REST history round-trips.
 *
 * To keep on-device storage bounded, every read/write applies a hard cap
 * (`MESSAGE_CACHE_CAP`): we only ever retain the most recent N messages per
 * conversation. This prevents the local store from growing without limit as
 * chat history accumulates over time.
 */
import { Preferences } from '@capacitor/preferences'
import type { Message } from './chatApi'
import { pruneMessages } from './pruneMessages'

// Re-export the pure pruning policy so callers can import it from here too.
export { MESSAGE_CACHE_CAP, pruneMessages } from './pruneMessages'

function cacheKey(peerId: number): string {
  return `comequeta_chat_${peerId}`
}

/** Load the cached message slice for a conversation (empty if none/invalid). */
export async function loadCachedMessages(peerId: number): Promise<Message[]> {
  try {
    const { value } = await Preferences.get({ key: cacheKey(peerId) })
    if (!value) return []
    const parsed = JSON.parse(value) as Message[]
    return Array.isArray(parsed) ? pruneMessages(parsed) : []
  } catch {
    return []
  }
}

/**
 * Persist a conversation's messages, capped so storage stays bounded.
 */
export async function saveCachedMessages(
  peerId: number,
  messages: Message[],
): Promise<void> {
  try {
    const bounded = pruneMessages(messages)
    await Preferences.set({
      key: cacheKey(peerId),
      value: JSON.stringify(bounded),
    })
  } catch {
    // Best-effort cache; a failure here must never break the chat UI.
  }
}

/** Drop a conversation's cached messages (e.g. when it is deleted). */
export async function clearCachedMessages(peerId: number): Promise<void> {
  try {
    await Preferences.remove({ key: cacheKey(peerId) })
  } catch {
    // Best-effort.
  }
}
