import { useContext, useState } from "react"
import { GlobalContext } from "../context/GlobalState";
import axios from 'axios'
import {DateTime} from 'luxon'
import '../styles/Register.scss'
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

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
            password,
            mode : selectedMode,
            timeStamp : DateTime.now().toLocaleString(DateTime.DATE_FULL)
           })
         
          if (response.error) {
            //console.log(response.error)
            showAlert(response.error, 'error')
          }
          else{
            //console.log(response.message)
            showAlert(response.message, 'success')
          }

        }catch(e) {
          console.log(e)
        }    
      }

      async function onlineRegister() {
        try{
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
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

    function submitRegister() {
      if (!userName || !password) {
        showAlert('name and password cannot be empty', 'error')
        return
      }

      if (userName.length < 4 || userName.length > 10) {
        showAlert('UserName must be between 4 and 10 characters ', 'error')
        return
      }

      if (password.length < 3 || password.length > 16) {
        showAlert('password must be between 2 and 16 characters', 'error')
        return
      }

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
