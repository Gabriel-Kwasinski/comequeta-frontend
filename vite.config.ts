/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Boots (or reuses) the real FastAPI backend for the auth integration tests.
    globalSetup: './src/test/backend.ts',
    css: false,
    // Real network round-trips are slower than mocks; give them headroom.
    testTimeout: 20_000,
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**'],
  },
})
