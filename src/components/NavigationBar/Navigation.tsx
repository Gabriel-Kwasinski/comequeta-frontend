import './Navigation.css'

function Navigation() {
  return (
    <nav className="nav">
      <a href="/map" className="site-title">Come Que Ta</a>
      <ul>
        <li>
          <a href="/map">Map</a>
        </li>
        <li>
          <a href="/chats">Chats</a>
        </li>
        <li>
          <a href="/profile">Perfil</a>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
