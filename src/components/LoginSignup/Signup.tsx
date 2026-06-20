import { type FormEvent, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import './Signup.css'

function Signup() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(undefined)
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    setIsSubmitting(true)
    try {
      await register(email, name, password)
      window.location.href = '/map'
    } catch {
      setError('Não foi possível criar a conta. O email já pode estar em uso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="container" onSubmit={handleSubmit}>
      <div className="header">
        <div className="text">Signup</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
      </div>
      {error && <p className="auth-error">{error}</p>}
      <div className="submit-container">
        <button className="submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando…' : 'Criar Conta'}
        </button>
      </div>
      <div className="register">
        Ja tem uma conta?
        <a className="login-btn" href="/"> Entrar</a>
      </div>
    </form>
  )
}

export default Signup
