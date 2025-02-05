import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../context/GlobalState";
import axios from "axios";


export default function Logs() {

    const {currentUser, showAlert, saveLog} = useContext(GlobalContext);
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
                saveLog(e.response.data.ServerErrorMsg, "createdAt", "error")
            }
            else {
                console.log(e.message)
                showAlert(e.message, 'error')
                saveLog(e.message, "createdAt", "error")
            }
        }
    }



    useEffect( () => {
        if (currentUser) {
            getLogs()
        }
    },[])


  return (
    <div>
        {
         messageLogs? (
            messageLogs.map((eachLog, index )=> (
                <div key={index}>
                    <p>{eachLog.logContent} || {eachLog.createdAt}</p>
                </div>
            ))
         ) 
         : (
            <div></div>
         )
        }
    </div>
  )
}
