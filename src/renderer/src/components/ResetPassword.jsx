import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import '../styles/ResetPass.scss'
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function ResetPassword() {

    const {alertAndLog, showAlert,  currentUser} = useContext(GlobalContext);
    const [isAuthorized, setIsAuthorized] = useState(false)

    const [password, setPassword] = useState('')
    const [confirmPass, setConfirmPass] = useState('')
    const [secretCode, setSecretCode] = useState('')
    const [toggleInput, setToggleInput] = useState(false)
    //console.log(currentUser)
    
    async function sendMail() {
        try {
            const res = await axios.post(`${API_BASE_URL}/users/${currentUser.userId}/generateCode`, {
                email : currentUser.email
            })
            setToggleInput(true)
            //console.log(res.data.message)
            showAlert(res.data.message)
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

    async function verifyCode() {
        //console.log(secretCode)
        try{
            const res = await axios.put(`${API_BASE_URL}/users/${currentUser.userId}/verifyCode`, {
                code : secretCode 
            })
            showAlert(res.data.message)
            setIsAuthorized(true)
        }
        catch(e) {
            if(e.response) {   
                if(e.response.data.ServerErrorMsg) {  
                  //console.log(e.response.data.ServerErrorMsg)
                  showAlert(e.response.data.ServerErrorMsg, "error") 
                }
                else {
                  //console.log(e.message)   
                  showAlert(e.messag, "error")
                }
            }
            else{  
                console.log(e)
            } 
            setToggleInput(false)
        }
    }

    async function resetPassword() {
        if (password.length < 3 || password.length > 16) {
            showAlert('password must be between 2 and 16 characters', 'error')
            return
        }
        try{
            const res = await axios.put(`${API_BASE_URL}/users/${currentUser.userId}/resetPassword`, {
                password
            })
            alertAndLog(res.data.message, "success")
            
        }   
       catch(e) {
            if(e.response) {   
                if(e.response.data.ServerErrorMsg) {  
                    //console.log(e.response.data.ServerErrorMsg)
                    alertAndLog(e.response.data.ServerErrorMsg, "error") 
                }
                else{
                //console.log(e.message)   
                alertAndLog(e.messag, "error")
                }
            }
            else{  
            console.log(e)
            } 
       }
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
                   <button onClick={resetPassword}>Reset password</button>
                 </div>
            ) 
            : (
            <div className="card"> 
              <p>Verify Code</p>
              {toggleInput &&
                <input 
                    placeholder="Verification Code" 
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                >
                </input> }
                <button onClick={sendMail}>get coode</button>
                <button onClick={verifyCode}>Verify code</button>
            </div>  
            )}   
        </div>
    )
}
