import { useState } from 'react'
import './Signup.css'

function Signup() {
  return (
    <div className="container">
      <div className="header">
        <div className="text">Signup</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <input type="text" placeholder="Nome completo"></input>
        </div>
      </div>
      <div className="inputs">
        <div className="input">
          <input type="text" placeholder="Email"></input>
        </div>
      </div>
      <div className="inputs">
        <div className="input">
          <input type="email" placeholder="Senha"></input>
        </div>
      </div>
      <div className="inputs">
        <div className="input">
          <input type="email" placeholder="Confirmar senha"></input>
        </div>
      </div>
      <div className="submit-container">
        <a className="submit" href="/map">
          Criar Conta
        </a>
      </div>
      <div className="register">
        Ja tem uma conta?
        <a class="login-btn" href="/">
          {' '}
          Entrar
        </a>
      </div>
    </div>
  )
}

export default Signup
