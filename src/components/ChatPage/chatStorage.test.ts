import { describe, expect, it } from 'vitest'
import { MESSAGE_CACHE_CAP, pruneMessages } from './pruneMessages'
import type { Message } from './pruneMessages'

function makeMessage(id: number, isoSecond: number): Message {
  return {
    id,
    sender_id: 1,
    recipient_id: 2,
    content: `m${id}`,
    created_at: `2026-06-20T00:00:${String(isoSecond).padStart(2, '0')}.000Z`,
    read_at: null,
  }
}

describe('pruneMessages', () => {
  it('keeps everything when under the cap', () => {
    const msgs = [makeMessage(1, 1), makeMessage(2, 2), makeMessage(3, 3)]
    expect(pruneMessages(msgs, 10)).toHaveLength(3)
  })

  it('keeps only the most recent `cap` messages', () => {
    const msgs = Array.from({ length: 5 }, (_, i) => makeMessage(i, i))
    const pruned = pruneMessages(msgs, 2)
    expect(pruned.map((m) => m.id)).toEqual([3, 4])
  })

  it('sorts ascending by created_at before pruning', () => {
    const msgs = [makeMessage(3, 30), makeMessage(1, 10), makeMessage(2, 20)]
    expect(pruneMessages(msgs).map((m) => m.id)).toEqual([1, 2, 3])
  })

  it('returns empty for a non-positive cap', () => {
    expect(pruneMessages([makeMessage(1, 1)], 0)).toEqual([])
  })

  it('defaults to MESSAGE_CACHE_CAP', () => {
    const msgs = Array.from({ length: MESSAGE_CACHE_CAP + 5 }, (_, i) =>
      makeMessage(i, i),
    )
    expect(pruneMessages(msgs)).toHaveLength(MESSAGE_CACHE_CAP)
  })
})
