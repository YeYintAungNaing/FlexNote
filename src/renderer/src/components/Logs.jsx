import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../context/GlobalState";
import axios from "axios";
import '../styles/Log.scss'


export default function Logs() {

    const {currentUser, showAlert} = useContext(GlobalContext);
    const [messageLogs, setMessageLogs] = useState(null)


    async function getLogs() {

        try{
            const response = await axios.get(`http://localhost:7000/users/${currentUser.userId}/history`)
            setMessageLogs(response.data)
        }
        catch(e) {
            if(e.response.data.ServerErrorMsg) {
                console.log(e.response.data.ServerErrorMsg)
                showAlert(e.response.data.ServerErrorMsg, 'error')
                
            }
            else {
                console.log(e.message)
                showAlert(e.message, 'error')    
            }
        }
    }


    useEffect( () => {
        if (currentUser) {
            getLogs()
        }
    },[])


  return (
    <div className="logs">
        {
         messageLogs? ( 
            <table> 
                <tr className="caption-row">
                    <th>TimeStamp</th>
                    <th>UserName</th>
                    <th>Description</th>
                    <th>Log type</th>
                </tr>
            {
            messageLogs.map((eachLog, index ) => (
                <tr key={index} className="data-row">
                    <td>{eachLog.createdAt}</td>
                    <td className="userName">{currentUser.userName}</td>
                    <td>{eachLog.logContent}</td>
                    <td className="logType">{eachLog.logType}</td>
                </tr>                  
            ))}
            </table>
         ) 
         : (
            <div>You must sign in first</div>
         )
        }
    </div>
  )
}



