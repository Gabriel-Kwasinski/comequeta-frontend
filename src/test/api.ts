// Helpers for the auth integration tests to talk to the REAL backend directly
// (e.g. to pre-create a user, or to read back persisted data via /users/me).
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

let seq = 0

/** A fresh, collision-proof email so tests are independent of backend state. */
export function uniqueEmail(prefix = 'user'): string {
  seq += 1
  return `${prefix}.${Date.now()}.${seq}@example.com`
}

export interface NewUser {
  email: string
  name: string
  password: string
}

/** Registers a user straight against the backend; returns the raw response. */
export function registerUser(user: NewUser): Promise<Response> {
  return fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
}

/** Reads the authenticated profile for a token, or null if unauthorized. */
export async function fetchMe(
  token: string,
): Promise<{ id: number; email: string; name: string } | null> {
  const res = await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.ok ? await res.json() : null
}
