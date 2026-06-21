// Shared validation helpers for the Login and Signup forms (SCRUM-1, SCRUM-3).
// Centralizes the field rules so the messages stay consistent between screens
// and match the backend expectations (email format, minimum password length).

export const PASSWORD_MIN_LENGTH = 8

// Pragmatic email pattern: requires local@domain.tld without spaces.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateName(name: string): string | undefined {
  if (!name.trim()) {
    return 'Informe seu nome completo.'
  }
  return undefined
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return 'Informe seu e-mail.'
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Informe um e-mail válido (ex.: nome@exemplo.com).'
  }
  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Informe sua senha.'
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`
  }
  return undefined
}

// Login only checks that a password was typed (length rules belong to signup).
export function validateLoginPassword(password: string): string | undefined {
  if (!password) {
    return 'Informe sua senha.'
  }
  return undefined
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) {
    return 'Confirme sua senha.'
  }
  if (password !== confirmPassword) {
    return 'As senhas não coincidem.'
  }
  return undefined
}

// Turns whatever the register API throws into a user-friendly message,
// distinguishing a duplicate e-mail from a generic failure.
export function describeRegisterError(error: unknown): string {
  const detail = extractDetail(error).toLowerCase()
  if (
    detail.includes('already') ||
    detail.includes('exist') ||
    detail.includes('registered') ||
    detail.includes('cadastr') ||
    detail.includes('em uso') ||
    detail.includes('duplicate')
  ) {
    return 'Este e-mail já está em uso. Tente entrar ou use outro e-mail.'
  }
  return 'Não foi possível criar a conta. Tente novamente em instantes.'
}

function extractDetail(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return ''
  }
  const maybeDetail = (error as { detail?: unknown }).detail
  if (typeof maybeDetail === 'string') {
    return maybeDetail
  }
  if (Array.isArray(maybeDetail)) {
    return maybeDetail
      .map((item) =>
        item && typeof item === 'object' && 'msg' in item
          ? String((item as { msg?: unknown }).msg ?? '')
          : '',
      )
      .join(' ')
  }
  const message = (error as { message?: unknown }).message
  return typeof message === 'string' ? message : ''
}
