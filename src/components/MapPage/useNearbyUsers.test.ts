import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useNearbyUsers } from './useNearbyUsers'

const CENTER = { lat: -23.5614, lng: -46.6559 }

describe('useNearbyUsers', () => {
  it('returns no users until a real nearby endpoint exists (mocks removed)', () => {
    // The fixed-id mock neighbours were removed because their ids collided with
    // real accounts (tapping one opened a chat with a real user). Conversations
    // are now started from the chat "Nova conversa" picker instead.
    const { result } = renderHook(() => useNearbyUsers(CENTER, 250))

    expect(result.current.users).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
