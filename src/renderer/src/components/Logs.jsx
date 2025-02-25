import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../context/GlobalState";
import axios from "axios";
import '../styles/Log.scss'



export default function Logs() {

    const {currentUser, showAlert, token} = useContext(GlobalContext);
    const [messageLogs, setMessageLogs] = useState(null)


    async function getLogOnline() {
        //const test = null

        try{
            const response = await axios.get(`http://localhost:7000/users/${currentUser.userId}/history`)
            setMessageLogs(response.data)
            //console.log(response.data)
        }
        catch(e) {
            if(e.response) {   
                if(e.response.data.ServerErrorMsg) {   // response always have data 
                  //console.log(e.response.data.ServerErrorMsg)
                  showAlert(e.response.data.ServerErrorMsg, "error")
                }
                else {
                  //console.log(e)   
                  showAlert(e.message, "error")
                }
            }
              else{  
                console.log(e)
            }
        }
    }

    async function getLog() {
        try {
            const response = await window.electron.getLog({
                token,
                userId : currentUser.id 
            })
            if (response.error) {
                showAlert(response.error, "error")
            }
            else{
                setMessageLogs(response)
            }
        }
        catch(e) {
            //console.log(e)
            showAlert("Unexpected error occur", 'error')  // error from electorn backend, type error from frontend  
        }
    }
        

    useEffect( () => {
        if (currentUser) {
            if (currentUser.mode === "Online") {
                getLogOnline()
            }
            else{
                getLog()
            }  
        }
    },[])


  return (
    <div className="logs">
        {
         currentUser? ( 
            <table> 
                <tbody>
                <tr className="caption-row">
                    <th>TimeStamp</th>
                    <th>UserName</th>
                    <th>Description</th>
                    <th>Log type</th>
                </tr>
                
            {
            messageLogs?.length > 0 && messageLogs.map((eachLog, index ) => (
                <tr key={index} className="data-row">
                    <td>{eachLog.createdAt}</td>
                    <td className="userName">{currentUser.userName}</td>
                    <td>{eachLog.logContent}</td>
                    <td className="logType">{eachLog.logType}</td>
                </tr>                  
            ))}
                </tbody>
            </table>
         ) 
         : (
            <div>You must sign in first</div>
         )
        }
    </div>
  )
}



