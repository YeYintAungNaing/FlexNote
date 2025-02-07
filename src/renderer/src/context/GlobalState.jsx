import { useEffect, useState } from "react";
import { createContext } from "react";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import axios from 'axios'
import {DateTime} from 'luxon'


export const GlobalContext = createContext(null);

// eslint-disable-next-line react/prop-types
export default function GlobalState({children}) {

    const [currentUser, setCurrentUser] = useState(null)
    const [token, setToken] = useState(() => window.localStorage.getItem('sessionToken'));  // lazy initializaiton instead of straight up call, 
    //const navigate = useNavigate()
    const [profileImg, setProfileImg] = useState(null)
    //console.log("from global state",currentUser)

    axios.defaults.withCredentials = true;

    async function getUserDetails() {
    
        try{
          if (token) {
            const response = await window.electron.verifyToken(token)
            
            if (response.currentUser) {
              setCurrentUser(response.currentUser)
              //console.log('verify token')
            }
            else{
              console.log('invalid token')
              localStorage.removeItem('sessionToken') // remove the existing token if the verificaiton process failed
            }
          }

        }catch(e) {
          console.log(e)
        }
      }

      async function getUserDetailsOnline() {  // this first check where there is jwt token and get user details
        try{
         const response = await axios.get('http://localhost:7000/auth/verifyToken')
          setCurrentUser(response.data)
          console.log('token comfired and get latest user data')

        }catch(e) {
          console.log(e.response.data.message)
        }
      }

      async function fetchProfileImage() {   
        if (!currentUser) {
          return
        }
        const imagePath = currentUser.profileImgPath;

        if (!imagePath) {
          return
        }

        if (currentUser.mode === "Online") {
          setProfileImg(imagePath)
        }
        else{
          const base64Image = await window.electron.getUserImg({  // using filepath of db to encapsulate the image data that can be used directly on browser
            token,
            imagePath,
            userId : currentUser.id
          })
          setProfileImg(base64Image);
        }
      }

    useEffect(() => {
      if(token) {   // this will happen when it is offline ( sessionToken is stored inside session storage)
        getUserDetails()
      }
      else{
        getUserDetailsOnline()
      }
    },[])

    function clearToken() {
      setToken(null);
      window.localStorage.removeItem('sessionToken');
      setCurrentUser(null)
      //navigate('/')
    }

    const [alert, setAlert] = useState({
      open: false,
      severity: 'success', // 'success' | 'info' | 'warning' | 'error'
      message: '',
  });



  function showAlert(message, severity) {
      setAlert({ open: true, severity, message });
    };
  
  const handleClose = () => {
      setAlert({ ...alert, open: false });
  };

  function alertAndLog(message, messageType) {
    showAlert(message, messageType)
    saveLog(message, messageType)
  }


  async function saveLog(logContent, logType) {
    if (!currentUser) {
      console.log('bruh')
      return
    }
    try{
      const res = await axios.post(`http://localhost:7000/users/${currentUser.userId}/history`, {
        logContent, 
        createdAt : DateTime.now().toLocaleString(DateTime.DATETIME_FULL),
        logType
      })
      console.log(res.data.message)
    }
    catch(e) {
      if(e.response) {    // if the error has a response 
        if(e.response.data.ServerErrorMsg) {  // check if error is from server
          console.log(e.response.data.ServerErrorMsg)  // have to access message via data (cause of axios)
        }
        else {
          console.log(e.message)   // if not from server, directly get message
        }
      }
      else{  // for other errors (type error and some shit, when the axios request does not get through)
        console.log(e)
      }   
    }  
  }


    return (
        <GlobalContext.Provider
        value={{
            currentUser,
            setCurrentUser,
            token,
            clearToken,
            getUserDetails,
            getUserDetailsOnline,
            showAlert,
            fetchProfileImage,
            profileImg,
            setProfileImg,
            saveLog,
            alertAndLog
        }}>
            {children}
            <Snackbar
              open={alert.open}
              autoHideDuration={3000} 
              onClose={handleClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              style={{ top: '70px' }}
            >
            <Alert severity={alert.severity} onClose={handleClose} variant="outlined">
                {alert.message}
            </Alert>
            </Snackbar>
        </GlobalContext.Provider>
    )
}
