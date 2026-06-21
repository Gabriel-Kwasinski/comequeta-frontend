/**
 * Chat orchestration hook.
 *
 * Owns the conversation list, the selected peer, the message thread, the
 * WebSocket lifecycle, and message sending. The thread is seeded from the
 * on-device cache for instant/offline display, then reconciled with REST
 * history. Inbound socket messages append live and refresh the cache.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildSendFrame,
  deleteConversation as apiDeleteConversation,
  getConversations,
  getMessages,
  markRead,
  openChatSocket,
  sendMessage,
  type Conversation,
  type Message,
} from './chatApi'
import {
  clearCachedMessages,
  loadCachedMessages,
  pruneMessages,
  saveCachedMessages,
} from './chatStorage'

function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const byId = new Map<number, Message>()
  for (const m of existing) byId.set(m.id, m)
  for (const m of incoming) byId.set(m.id, m)
  return pruneMessages([...byId.values()])
}

export interface UseChatResult {
  conversations: Conversation[]
  selectedPeer: number | null
  messages: Message[]
  currentUserId: number | undefined
  loadingThread: boolean
  selectPeer: (peerId: number) => void
  send: (content: string) => Promise<void>
  removeConversation: (peerId: number) => Promise<void>
}

export function useChat(currentUserId: number | undefined): UseChatResult {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedPeer, setSelectedPeer] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingThread, setLoadingThread] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)
  const selectedPeerRef = useRef<number | null>(null)

  // Mirror the selected peer into a ref so async callbacks (socket handlers,
  // REST resolutions) can read the latest value without going stale.
  useEffect(() => {
    selectedPeerRef.current = selectedPeer
  }, [selectedPeer])

  // Load the conversation list once on mount.
  useEffect(() => {
    let active = true
    getConversations()
      .then((list) => {
        if (active) setConversations(list)
      })
      .catch(() => {
        /* keep empty state on failure */
      })
    return () => {
      active = false
    }
  }, [])

  // Append an inbound/just-sent message to the active thread + cache.
  const ingestMessage = useCallback((message: Message) => {
    const peer = selectedPeerRef.current
    const threadPeer =
      message.sender_id === peer || message.recipient_id === peer ? peer : null

    if (threadPeer != null) {
      setMessages((prev) => {
        const next = mergeMessages(prev, [message])
        void saveCachedMessages(threadPeer, next)
        return next
      })
    }

    // Reflect activity in the conversation list (best-effort refresh).
    getConversations()
      .then(setConversations)
      .catch(() => {})
  }, [])

  // Open the WebSocket on mount for real-time delivery.
  useEffect(() => {
    const socket = openChatSocket(ingestMessage)
    socketRef.current = socket
    return () => {
      socketRef.current = null
      socket.close()
    }
  }, [ingestMessage])

  // When a peer is selected, seed from cache then load REST history.
  const selectPeer = useCallback((peerId: number) => {
    setSelectedPeer(peerId)
    setLoadingThread(true)

    loadCachedMessages(peerId).then((cached) => {
      // Only seed if this peer is still the active one.
      if (selectedPeerRef.current === peerId && cached.length) {
        setMessages(cached)
      }
    })

    getMessages(peerId, { limit: 100 })
      .then((history) => {
        if (selectedPeerRef.current !== peerId) return
        const ordered = pruneMessages(history)
        setMessages(ordered)
        void saveCachedMessages(peerId, ordered)
      })
      .catch(() => {
        /* keep cached/empty thread on failure */
      })
      .finally(() => {
        if (selectedPeerRef.current === peerId) setLoadingThread(false)
      })

    markRead(peerId)
      .then(() => {
        setConversations((prev) =>
          prev.map((c) => (c.peer_id === peerId ? { ...c, unread: 0 } : c)),
        )
      })
      .catch(() => {})
  }, [])

  const send = useCallback(
    async (content: string) => {
      const peer = selectedPeerRef.current
      const trimmed = content.trim()
      if (peer == null || !trimmed) return

      // Prefer the live socket; the server echoes the persisted message back to
      // us (with its real id), so we do NOT render optimistically here — doing
      // so would show the message twice (temp id + echoed real id).
      const socket = socketRef.current
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(buildSendFrame(peer, trimmed))
        return
      }

      // REST fallback: the POST does not echo over the socket, so ingest the
      // created message ourselves.
      try {
        const created = await sendMessage(peer, trimmed)
        ingestMessage(created)
      } catch {
        /* swallow; UI keeps the composer text via caller if desired */
      }
    },
    [ingestMessage],
  )

  const removeConversation = useCallback(async (peerId: number) => {
    try {
      await apiDeleteConversation(peerId)
    } catch {
      /* best-effort: still clear it from the UI/cache below */
    }
    await clearCachedMessages(peerId)
    setConversations((prev) => prev.filter((c) => c.peer_id !== peerId))
    if (selectedPeerRef.current === peerId) {
      setSelectedPeer(null)
      setMessages([])
    }
  }, [])

  return {
    conversations,
    selectedPeer,
    messages,
    currentUserId,
    loadingThread,
    selectPeer,
    send,
    removeConversation,
  }
}
