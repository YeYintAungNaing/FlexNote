import { useContext, useState } from "react"
import { GlobalContext } from "../context/GlobalState"
import { Link } from "react-router-dom";
import axios from 'axios'
import "../styles/Login.scss"

export default function Login() {

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const { setCurrentUser} = useContext(GlobalContext);
    const [selectedMode, setSelectedMode] = useState('Online')

    //axios.defaults.withCredentials = true;

    function formSubmit() {
      if (selectedMode === "Offline") {
        login()
      }
      else{
        loginOnline()
      }
    }

    async function login() {

        try{
          const response = await window.electron.loginUser({
            userName,
            password
           })
          if(response.token) {
            window.localStorage.setItem('sessionToken', response.token)
            console.log('login success')
            setCurrentUser(response.user)
            
          }
          else{
            console.log( response.message)
          }
        }catch(e) {
          console.log(e)
        }    
      }

      async function loginOnline() {
        try{
          const response = await axios.post("http://localhost:7000/auth/login", {userName, password});

          setCurrentUser(response.data)
          console.log('signed in')
          
        }catch(e) {
          console.log("from frontend", e.response.data.message)
        }
    }
    //console.log(selectedMode)

    function toggleOnline() {
      if (selectedMode === "Online") {
        return
      }
      setSelectedMode("Online")
      document.getElementById('online').className = "toggle-btn selected"
      document.getElementById('offline').className = "toggle-btn"
    }

    function toggleOffline() {
      if (selectedMode === "Offline") {
        return
      }
      setSelectedMode("Offline")
      document.getElementById('online').className = "toggle-btn"
      document.getElementById('offline').className = "toggle-btn selected"
    }

    return (
        <div className="login">
          <div className="login-card">
          <p>Login</p>
            <input 
                placeholder="Name" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                >
            </input>
            <input 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                >
            </input>
            <div className="toggles">
              <button id="online" className="toggle-btn selected"  onClick={toggleOnline}>Online</button>
              <button id="offline" className="toggle-btn" onClick={toggleOffline}>Offline</button>
            </div>
            <button onClick={formSubmit}>Login</button>
            <Link to='/register'>
              <button className="register">Register new account</button>
            </Link>
            </div>
        </div>
    )
}
