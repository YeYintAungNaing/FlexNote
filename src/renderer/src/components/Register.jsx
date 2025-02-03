import { useContext, useState } from "react"
import { GlobalContext } from "../context/GlobalState";
import axios from 'axios'
import {DateTime} from 'luxon'

export default function Register() {

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const { showAlert} = useContext(GlobalContext);
    const [mode, setMode] = useState("Offline")
    
    console.log(mode)
    
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
              mode,
              timeStamp : DateTime.now().toLocaleString(DateTime.DATE_FULL)
            })
            console.log(response.data.message)
            showAlert(response.data.message, 'success')
        }catch(e) {
          console.log(e.response.data.message)
        }
      }

    function submitRegister() {
      if (mode === "Offline") {
        register()
      }
      else{
        onlineRegister()
      }
    }

    return (
        <div>
          <div>register</div>
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
            <input 
                type="radio"
                value="Offline"
                name="mode"
                id="offline"
                onChange={(e)=> {setMode(e.target.value)}}
                checked={mode === "Offline"}
                >
            </input>
            <label htmlFor="offline">Offline</label>
            <input 
                type="radio"
                value="Online"
                name="mode"
                id="online"
                onChange={(e)=> {setMode(e.target.value)}}
                checked={mode === "Online"}
                >
            </input>
            <label htmlFor="online">Online</label>
            <button onClick={submitRegister}>Submit</button>
        </div>
    )
}
