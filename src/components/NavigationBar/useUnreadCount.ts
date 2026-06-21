import { useQuery } from '@tanstack/react-query'
import { getConversations } from '../ChatPage/chatApi'

/**
 * Total number of unread chat messages across all conversations.
 *
 * Polls the conversation list so the badge on the "Chats" nav item lights up
 * even while the user is on another tab (e.g. the map). The same
 * `['conversations']` query key is invalidated by the chat when messages are
 * read/received, so the badge updates promptly too.
 */
export function useUnreadCount(): number {
  const { data } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 8000,
  })
  return (data ?? []).reduce((sum, conv) => sum + conv.unread, 0)
}
