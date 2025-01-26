import { useContext, useState } from "react"
import { GlobalContext } from "../context/GlobalState";
import axios from 'axios'

export default function Register() {

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const { showAlert} = useContext(GlobalContext);
    const [mode, setMode] = useState("Offline")
    
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
              mode
            })
            console.log(response.data.message)
        }catch(e) {
          console.log("from frontend", e.response.data.message)
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
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                >
            </input>
            <button onClick={onlineRegister}>Submit</button>
        </div>
    )
}
