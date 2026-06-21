import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../ui/Button/Button'
import { Input } from '../ui/Input/Input'
import { useChat } from './useChat'
import './ChatPage.css'

function ChatPage() {
  const { user } = useAuth()
  const {
    conversations,
    selectedPeer,
    messages,
    currentUserId,
    loadingThread,
    selectPeer,
    send,
  } = useChat(user?.id)

  const [searchParams] = useSearchParams()
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Deep link: /chats?peer=<id> opens a thread with a specific neighbour
  // (e.g. the "iniciar conversa" button on a neighbour profile).
  const peerParam = searchParams.get('peer')
  useEffect(() => {
    if (!peerParam) return
    const peerId = Number(peerParam)
    if (Number.isFinite(peerId) && peerId !== selectedPeer) {
      selectPeer(peerId)
    }
  }, [peerParam, selectedPeer, selectPeer])

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeName = useMemo(() => {
    const conv = conversations.find((c) => c.peer_id === selectedPeer)
    if (conv) return conv.peer_name
    return selectedPeer != null ? `Vizinho #${selectedPeer}` : ''
  }, [conversations, selectedPeer])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setDraft('')
    void send(content)
  }

  return (
    <div className="chat-page">
      <aside className="chat-list">
        <h1 className="chat-list__title">Conversas</h1>
        <div className="chat-list__items">
          {conversations.length === 0 ? (
            <p className="chat-list__empty">
              Você ainda não tem conversas. Visite o perfil de um vizinho para
              iniciar uma conversa.
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.peer_id}
                type="button"
                className={[
                  'chat-list__item',
                  conv.peer_id === selectedPeer
                    ? 'chat-list__item--active'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectPeer(conv.peer_id)}
              >
                <span className="chat-list__item-top">
                  <span className="chat-list__name">{conv.peer_name}</span>
                  {conv.unread > 0 && (
                    <span className="chat-list__unread">{conv.unread}</span>
                  )}
                </span>
                {conv.last_message && (
                  <span className="chat-list__preview">
                    {conv.last_message}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="chat-thread">
        {selectedPeer == null ? (
          <div className="chat-thread__empty">
            Selecione uma conversa para começar a conversar.
          </div>
        ) : (
          <>
            <header className="chat-thread__header">{activeName}</header>
            <div className="chat-thread__messages">
              {messages.length === 0 && !loadingThread ? (
                <div className="chat-thread__empty">
                  Nenhuma mensagem ainda. Diga olá!
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={[
                      'chat-bubble',
                      msg.sender_id === currentUserId
                        ? 'chat-bubble--mine'
                        : 'chat-bubble--theirs',
                    ].join(' ')}
                  >
                    {msg.content}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-thread__composer" onSubmit={handleSubmit}>
              <Input
                aria-label="Mensagem"
                placeholder="Escreva uma mensagem…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button type="submit" variant="primary" disabled={!draft.trim()}>
                Enviar
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}

export default ChatPage
