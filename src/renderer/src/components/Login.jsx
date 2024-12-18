import { useContext, useState } from "react"
import { GlobalContext } from "../context/GlobalState"
import { Link } from "react-router-dom";

export default function Login() {

    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const { setCurrentUser} = useContext(GlobalContext);

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

    return (
        <div>
          <div>Login</div>
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
            <Link to='/register'>
              <button>register</button>
            </Link>
            
        </div>
    )
}
