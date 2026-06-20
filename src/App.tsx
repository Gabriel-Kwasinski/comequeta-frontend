import './App.css'
import Signup from './components/LoginSignup/Signup.jsx'
import Login from './components/LoginSignup/Login.jsx'
import MapPage from './components/MapPage/MapPage.jsx'
import ChatPage from './components/ChatPage/ChatPage.jsx'
import ProfilePage from './components/ProfilePage/ProfilePage.jsx'

function App() {
  let component = <Login></Login>

  console.log(window.location)
  switch (window.location.pathname) {
    case '/signup':
      component = <Signup></Signup>
      break
    case '/map':
      component = <MapPage></MapPage>
      break
    case '/chats':
      component = <ChatPage></ChatPage>
      break
    case '/profile':
      component = <ProfilePage></ProfilePage>
      break
  }
  return component
}

export default App
