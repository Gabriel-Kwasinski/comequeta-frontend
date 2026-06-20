import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Single MSW server instance shared across the test run.
export const server = setupServer(...handlers)
