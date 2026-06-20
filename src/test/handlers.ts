import { http, HttpResponse } from 'msw'

// Mirrors the default baseUrl in src/api/client.ts (VITE_API_URL fallback).
const API = 'http://localhost:8000'

/**
 * In-memory user store so registration actually "persists" a user that the
 * subsequent login / /users/me calls can read back. Keyed by email.
 */
export interface StoredUser {
  id: number
  email: string
  name: string
  password: string
}

export const userStore = new Map<string, StoredUser>()
let nextId = 1

export function seedUser(user: {
  email: string
  name: string
  password: string
}) {
  const stored: StoredUser = { id: nextId++, ...user }
  userStore.set(user.email, stored)
  return stored
}

export function resetUserStore() {
  userStore.clear()
  nextId = 1
}

const TOKEN_PREFIX = 'token-for:'

function tokenFor(email: string) {
  return `${TOKEN_PREFIX}${email}`
}

function emailFromToken(token: string | null): string | null {
  if (!token) return null
  const value = token.replace(/^Bearer\s+/i, '')
  if (!value.startsWith(TOKEN_PREFIX)) return null
  return value.slice(TOKEN_PREFIX.length)
}

export const handlers = [
  // Registration (application/json). 201 on success, 400 on duplicate email.
  http.post(`${API}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string
      name: string
      password: string
    }

    if (userStore.has(body.email)) {
      return HttpResponse.json(
        { detail: 'Email already registered' },
        { status: 400 },
      )
    }

    const user = seedUser(body)
    return HttpResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 },
    )
  }),

  // Login (application/x-www-form-urlencoded). 200 + token on success, 401 on bad creds.
  http.post(`${API}/auth/login`, async ({ request }) => {
    const form = new URLSearchParams(await request.text())
    const username = form.get('username') ?? ''
    const password = form.get('password') ?? ''

    const user = userStore.get(username)
    if (!user || user.password !== password) {
      return HttpResponse.json(
        { detail: 'Incorrect email or password' },
        { status: 401 },
      )
    }

    return HttpResponse.json(
      { access_token: tokenFor(username), token_type: 'bearer' },
      { status: 200 },
    )
  }),

  // Current user, resolved from the bearer token.
  http.get(`${API}/users/me`, ({ request }) => {
    const email = emailFromToken(request.headers.get('Authorization'))
    const user = email ? userStore.get(email) : null
    if (!user) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 })
    }
    return HttpResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  }),
]
