/**
 * Hand-written typed client for the chat API (backend PR #4).
 *
 * The generated `schema.d.ts` does not yet describe these endpoints, so the
 * contract is encoded by hand here. All requests carry the bearer token from
 * `tokenStorage`. Real-time delivery is provided by `openChatSocket`.
 */
import { getToken } from '../../auth/tokenStorage'
import type { Message } from './pruneMessages'

export type { Message } from './pruneMessages'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface Conversation {
  peer_id: number
  peer_name: string
  last_message: string | null
  last_at: string | null
  unread: number
}

/** Inbound WebSocket frame (server → client). */
interface MessageFrame {
  type: 'message'
  message: Message
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status} ${res.statusText}`)
  }
  // Some endpoints (mark-read) return no body.
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** List the current user's conversations, most-recent activity first. */
export function getConversations(): Promise<Conversation[]> {
  return request<Conversation[]>('/chat/conversations')
}

/**
 * Fetch a page of messages with `peerId` (most recent first per the contract).
 * `before` allows cursor-style pagination by ISO timestamp.
 */
export function getMessages(
  peerId: number,
  options: { before?: string; limit?: number } = {},
): Promise<Message[]> {
  const params = new URLSearchParams()
  if (options.before) params.set('before', options.before)
  if (options.limit != null) params.set('limit', String(options.limit))
  const qs = params.toString()
  return request<Message[]>(`/chat/messages/${peerId}${qs ? `?${qs}` : ''}`)
}

/** Send a message to `recipientId`; resolves to the created message. */
export function sendMessage(
  recipientId: number,
  content: string,
): Promise<Message> {
  return request<Message>('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ recipient_id: recipientId, content }),
  })
}

/** Mark all messages from `peerId` as read. */
export function markRead(peerId: number): Promise<void> {
  return request<void>(`/chat/messages/${peerId}/read`, { method: 'POST' })
}

/**
 * Open the chat WebSocket and invoke `onMessage` for each inbound message.
 * Derives ws/wss + host from `VITE_API_URL` and authenticates via query token.
 */
export function openChatSocket(
  onMessage: (message: Message) => void,
): WebSocket {
  const httpUrl = new URL(API_URL)
  const wsProtocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  const token = getToken() ?? ''
  const url = `${wsProtocol}//${httpUrl.host}/ws/chat?token=${encodeURIComponent(token)}`

  const socket = new WebSocket(url)
  socket.addEventListener('message', (event) => {
    try {
      const frame = JSON.parse(event.data as string) as MessageFrame
      if (frame.type === 'message' && frame.message) {
        onMessage(frame.message)
      }
    } catch {
      // Ignore malformed frames.
    }
  })
  return socket
}

/** Build a client → server message frame (JSON string). */
export function buildSendFrame(recipientId: number, content: string): string {
  return JSON.stringify({
    type: 'message',
    recipient_id: recipientId,
    content,
  })
}
