import { useContext, useState } from "react"
import { GlobalContext } from "../context/GlobalState";

export default function Register() {

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const { showAlert} = useContext(GlobalContext);

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
            <button onClick={register}>Submit</button>
        </div>
    )
}
