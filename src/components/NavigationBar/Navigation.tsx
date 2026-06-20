import { Link, NavLink } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="nav">
      <Link to="/map" className="site-title">
        Come Que Ta
      </Link>
      <ul>
        <li>
          <NavLink to="/map">Map</NavLink>
        </li>
        <li>
          <NavLink to="/chats">Chats</NavLink>
        </li>
        <li>
          <NavLink to="/profile">Perfil</NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
