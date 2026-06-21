import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../ui/Button/Button'
import { Input } from '../ui/Input/Input'
import { getUsers, type ChatUser } from './chatApi'
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

  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // "Nova conversa" picker state.
  const [showPicker, setShowPicker] = useState(false)
  const [allUsers, setAllUsers] = useState<ChatUser[]>([])
  const [usersLoaded, setUsersLoaded] = useState(false)

  // Both the profile "Conversar" deep link and the "Nova conversa" picker put
  // the target in the URL (?peer=<id>&name=<name>). This effect depends only on
  // `peerParam` (NOT `selectedPeer`), so it applies the peer when the link
  // changes but never fights the user manually switching conversations.
  const peerParam = searchParams.get('peer')
  const nameParam = searchParams.get('name')
  useEffect(() => {
    if (!peerParam) return
    const peerId = Number(peerParam)
    if (Number.isFinite(peerId)) {
      selectPeer(peerId)
    }
  }, [peerParam, selectPeer])

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeName = useMemo(() => {
    const conv = conversations.find((c) => c.peer_id === selectedPeer)
    if (conv) return conv.peer_name
    if (
      selectedPeer != null &&
      nameParam &&
      Number(peerParam) === selectedPeer
    ) {
      return nameParam
    }
    return selectedPeer != null ? `Vizinho #${selectedPeer}` : ''
  }, [conversations, selectedPeer, peerParam, nameParam])

  function openPicker() {
    setShowPicker(true)
    if (!usersLoaded) {
      getUsers()
        .then((users) => {
          setAllUsers(users)
          setUsersLoaded(true)
        })
        .catch(() => {
          /* keep empty list on failure */
        })
    }
  }

  function startChat(picked: ChatUser) {
    setShowPicker(false)
    // Drive selection through the URL (so the header name resolves) and also
    // select directly so re-picking the same user still works.
    setSearchParams({ peer: String(picked.id), name: picked.name })
    selectPeer(picked.id)
  }

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
        <div className="chat-list__head">
          <h1 className="chat-list__title">Conversas</h1>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => (showPicker ? setShowPicker(false) : openPicker())}
          >
            {showPicker ? 'Fechar' : 'Nova conversa'}
          </Button>
        </div>

        {showPicker && (
          <div className="chat-picker">
            {allUsers.length === 0 ? (
              <p className="chat-list__empty">
                Nenhum outro usuário cadastrado ainda.
              </p>
            ) : (
              allUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="chat-list__item"
                  onClick={() => startChat(u)}
                >
                  <span className="chat-list__name">{u.name}</span>
                  <span className="chat-list__preview">{u.email}</span>
                </button>
              ))
            )}
          </div>
        )}

        <div className="chat-list__items">
          {conversations.length === 0 ? (
            <p className="chat-list__empty">
              Você ainda não tem conversas. Use “Nova conversa” para falar com
              alguém.
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
