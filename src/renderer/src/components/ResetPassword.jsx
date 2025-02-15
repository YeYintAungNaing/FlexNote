import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import '../styles/ResetPass.scss'
import axios from "axios";
export default function ResetPassword() {

    const {alertAndLog, currentUser, setCurrentUser} = useContext(GlobalContext);
    const [isAuthorized, setIsAuthorized] = useState(false)

    const [password, setPassword] = useState('')
    const [confirmPass, setConfirmPass] = useState('')
    const [secretCode, setSecretCode] = useState('')
    console.log(currentUser)
    
    async function sendMail() {
        const res = await axios.get(`http://localhost:7000/users/${currentUser.userId}/verifyCode`)
        console.log(res.data.message)
    }

    return (
        <div className="reset-password">
            
            { isAuthorized? (
                 <div className="card">
                 <p>Reset Password</p>
                 <input 
                       placeholder="Password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       >
                   </input>
                   <input 
                       placeholder="Confirm password" 
                       value={confirmPass}
                       onChange={(e) => setConfirmPass(e.target.value)}
                       >
                   </input>
                   <button>Reset password</button>
                 </div>
            ) 
            : (
            <div className="card"> 
              <p>Verify Code</p>
                 <input 
                       placeholder="Verification Code" 
                       value={secretCode}
                       onChange={(e) => setSecretCode(e.target.value)}
                       >
                </input>
                <button onClick={sendMail}>Verify code</button>
            </div>  
            )}   
        </div>
    )
}
