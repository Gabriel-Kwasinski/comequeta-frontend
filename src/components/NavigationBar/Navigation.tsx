import { Link, NavLink } from 'react-router-dom'
import './Navigation.css'
import { useUnreadCount } from './useUnreadCount'

function Navigation() {
  const unread = useUnreadCount()

  return (
    <nav className="nav">
      <Link to="/map" className="site-title">
        <img src="/logo.png" alt="Comé que Tá" className="site-logo" />
      </Link>
      <ul>
        <li>
          <NavLink to="/map">Mapa</NavLink>
        </li>
        <li>
          <NavLink to="/chats" className="nav__chats">
            Chats
            {unread > 0 && (
              <span
                className="nav__badge"
                aria-label={`${unread} mensagens não lidas`}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile">Perfil</NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
