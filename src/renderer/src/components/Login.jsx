import { useState } from "react"

export default function Login() {

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")

    async function login() {

        try{
          const response = await window.electron.loginUser({
            userName,
            password
           })
          console.log( response.message)
          if(response.token) {
            console.log('this happen')
            window.localStorage.setItem('sessionToken', response.token)
          }
        }catch(e) {
          console.log(e)
        }    
      }

    return (
        <div>
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
            <button onClick={login}>Submit</button>
        </div>
    )
}
