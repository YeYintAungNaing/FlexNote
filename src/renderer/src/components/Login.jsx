import { useContext, useState } from "react"
import { GlobalContext } from "../context/GlobalState"
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'
import "../styles/Login.scss"


export default function Login() {

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const { setCurrentUser, showAlert, currentUser, setToken} = useContext(GlobalContext);
    const [selectedMode, setSelectedMode] = useState('Online')
    const navigate = useNavigate()

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
          if (response.error) {
            showAlert(response.error, "error")
            return
          }
          if(response.token || response.user) {
            window.localStorage.setItem('sessionToken', response.token)
            console.log('login success')
            setCurrentUser(response.user)
            setToken(response.token)
            showAlert(response.message)
            //navigate('/')   
          }
        }catch(e) {
          showAlert("Unexpected error", "error")
        }    
      }

      async function loginOnline() {
        try{
          const response = await axios.post("http://localhost:7000/auth/login", {userName, password});
          const { expirationTime, ...userData} = response.data
          setCurrentUser(userData)
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('tokenExpirationTime', expirationTime);
          showAlert("Login scuuess", "success")
          //refetch() 
          navigate('/')
            
        }catch(e) {
          if(e.response) {   
            if(e.response.data.ServerErrorMsg) {  
              //console.log(e.response.data.ServerErrorMsg)
              showAlert(e.response.data.ServerErrorMsg, "error") 
            }
            else {
              //console.log(e.message)   
              showAlert(e.message, "error")
            }
          }
          else{  
            console.log(e)
          } 
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
      <>
        {
          currentUser? (
            <div>your have already log in</div>
          ) 
          : (
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
              <Link className="links" to='/register'>
                <button className="register">Register new account</button>
              </Link>
              </div>
          </div>
          )
        }
        </>
    )
}
