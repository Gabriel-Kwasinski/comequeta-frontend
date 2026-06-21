// Vitest globalSetup that makes the REAL backend available for the auth
// integration tests. If a backend is already reachable on :8000 (e.g. a dev
// instance), it is reused as-is; otherwise the FastAPI app in
// ../comequeta-backend is started against a throwaway SQLite database and torn
// down at the end. Requires `uv` on PATH (the backend is a uv project).
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'

const BASE_URL = 'http://localhost:8000'
const HEALTH_URL = `${BASE_URL}/health`
const BACKEND_DIR = path.resolve(process.cwd(), '../comequeta-backend')
const DB_FILENAME = '_e2e_test.db'
const DB_PATH = path.join(BACKEND_DIR, DB_FILENAME)

let child: ChildProcess | undefined

async function isUp(): Promise<boolean> {
  try {
    const res = await fetch(HEALTH_URL)
    return res.ok
  } catch {
    return false
  }
}

async function waitUntilUp(timeoutMs = 90_000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await isUp()) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(
    `Backend did not become ready at ${HEALTH_URL} within ${timeoutMs}ms`,
  )
}

function removeDbFiles(): void {
  for (const suffix of ['', '-wal', '-shm']) {
    try {
      rmSync(`${DB_PATH}${suffix}`, { force: true })
    } catch {
      // File may be locked on Windows right after shutdown; best-effort.
    }
  }
}

export async function setup(): Promise<void> {
  if (await isUp()) {
    // Reuse an already-running backend; do not manage its lifecycle.
    return
  }

  removeDbFiles()
  child = spawn(
    'uv',
    ['run', 'uvicorn', 'app.main:app', '--port', '8000', '--no-access-log'],
    {
      cwd: BACKEND_DIR,
      env: { ...process.env, DATABASE_URL: `sqlite:///./${DB_FILENAME}` },
      stdio: 'ignore',
      shell: true, // resolve `uv` from PATH on Windows
    },
  )

  await waitUntilUp()
}

export async function teardown(): Promise<void> {
  if (!child) return

  if (process.platform === 'win32' && child.pid) {
    // Kill the whole process tree (shell -> uv -> uvicorn) on Windows.
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'])
  } else {
    child.kill('SIGTERM')
  }

  await new Promise((resolve) => setTimeout(resolve, 500))
  removeDbFiles()
}
