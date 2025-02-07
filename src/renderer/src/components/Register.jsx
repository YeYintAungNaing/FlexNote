import { useContext, useState } from "react"
import { GlobalContext } from "../context/GlobalState";
import axios from 'axios'
import {DateTime} from 'luxon'
import '../styles/Register.scss'
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate()
    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const { showAlert} = useContext(GlobalContext);
    const [selectedMode, setSelectedMode] = useState('Online')
    
    
    
    async function register() {

        try{
          const response = await window.electron.createUser({
            userName,
            password
           })
         
          if (response.error) {
            //console.log(response.error)
            showAlert(response.error, 'error')
          }
          else{
            console.log(response.message)
            showAlert(response.message, 'success')
          }

        }catch(e) {
          console.log(e)
        }    
      }

      async function onlineRegister() {
        try{
            const response = await axios.post('http://localhost:7000/auth/register', {
              userName,
              password,
              mode : selectedMode,
              timeStamp : DateTime.now().toLocaleString(DateTime.DATE_FULL)
            })
            //console.log(response.data.message)
            showAlert(response.data.message, 'success')
            navigate('/login')
        }
        catch(e) {
          if(e.response.data.ServerErrorMsg) {
            //console.log(e.response.data.ServerErrorMsg)
            showAlert(e.response.data.ServerErrorMsg, 'error')
          }
          else {
            //console.log(e.message)
            showAlert(e.message, 'error')
          }
        }
      }

    function submitRegister() {
      if (selectedMode === "Offline") {
        register()
      }
      else{
        onlineRegister()
      }
    }

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
        <div className="register">
          <div className="register-card">
          <p>Register</p>
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
            <button onClick={submitRegister}>Register</button>
            <Link className="links" to='/login'>
              <button className="login">Login into existing account ?</button>
            </Link>
            
          </div>
        </div>
    )
}
