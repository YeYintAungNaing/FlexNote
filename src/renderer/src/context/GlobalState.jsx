import { useEffect, useState } from "react";
import { createContext } from "react";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import axios from 'axios'
import {DateTime} from 'luxon'
//import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from "../config";

export const GlobalContext = createContext(null);

// eslint-disable-next-line react/prop-types
export default function GlobalState({children}) {

    const [currentUser, setCurrentUser] = useState(null)
    const [token, setToken] = useState(() => window.localStorage.getItem('sessionToken'));  // lazy initializaiton instead of straight up call, 
    const [isLoading, setIsLoading] = useState(true)
    const [profileImg, setProfileImg] = useState(null)
    const [notes, setNotes] = useState(null)
    
    //console.log("from global state",currentUser)

    axios.defaults.withCredentials = true;
    //console.log(currentUser)

    async function getUserDetails() {
    
        try{
          if (token) {
            const response = await window.electron.verifyToken(token)
            
            if (response.currentUser) {
              setCurrentUser(response.currentUser)
              setIsLoading(false)
              //console.log('verify token')
            }
            else if (response.error) {
              showAlert(response.error, "error")
              localStorage.removeItem('sessionToken') // remove the existing token if the verificaiton process failed
              setIsLoading(false)
            }
          }

        }catch(e) {
          showAlert("Unexpected error occurs", "error")
        }
      }

      async function getUserDetailsOnline() {  // this first check where there is jwt token and get user details
        try{
          // trying local storage caching  was a mistake zzzzzzz
          // const storedExpirationTime = localStorage.getItem('tokenExpirationTime');
          // const storedUserData = JSON.parse(localStorage.getItem('userData'));
          // if (storedExpirationTime && storedUserData) {
          //   const currentTime = Date.now();
          //   if (currentTime > storedExpirationTime) {
          //     console.log('Token expired');
          //   } 
          //   else {
          //     console.log('still valid');
          //     setCurrentUser(storedUserData)
          //     //refetch()
          //     setIsLoading(false)
          //     return
          //   }
          // }
          const response = await axios.get(`${API_BASE_URL}/auth/verifyToken`)
          console.log("token verify")
          if (typeof response.data !== "object") {
            throw new Error("Invalid API response. Expected JSON but received HTML.");
          }
          setCurrentUser(response.data) 
          //console.log('token comfired and get latest user data')
          //refetch()  
          setIsLoading(false)

        }catch(e) {
          if(e.response) {   
            if(e.response.data.ServerErrorMsg) {  
              //console.log(e.response.data.ServerErrorMsg)
              showAlert(e.response.data.ServerErrorMsg, "error")
            }
            else {
              console.log(e.message)   
              showAlert(e.message, "error")
            }
          }
          else{  
            console.log(e.message)
          } 
          setCurrentUser(null)
          setIsLoading(false)
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
          try{
            const response = await window.electron.getUserImg({  // using filepath of db to encapsulate the image data that can be used directly on browser
              token,
              imagePath,
              userId : currentUser.id
            })
            
            if(response.error) {
              alertAndLog(response.error)
            }
            else{
              setProfileImg(response);
            }
            
          }
          catch(e) {
            showAlert("Unexpected error ocuurs", "error")
          }
         
        }
      }

      // const {data : onlineNotes, refetch} = useQuery({
      //   queryKey : ['notes'],
      //   queryFn : getNotesOnline,
      //   staleTime: 5 * 60 * 1000,
      //   enabled: currentUser?.mode === "Online" ? true : false, 
      //   initialData : null
      // })

  
      async function  getNotesOnline() {
        try{
            const response = await axios.get(`${API_BASE_URL}/notes`)
            
            if (response.data.length >  0) {
              console.log('notes fetched')
              setNotes(response.data)
              return response.data
              
            }
            else{
              return null
            }
        }
        catch(e) {
          if(e.response) {
            console.log(e.response.data.message)
            return null
          }
          else {
            console.log(e)
            return null
          }
        }
      }

    useEffect(() => {
      setIsLoading(true)
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
    if (!currentUser) {
      console.log('bruh')
      return
    }
    showAlert(message, messageType)
    if (currentUser.mode === "Online") {
      saveLogOnline(message, messageType)
    }
    else {
      saveLog(message, messageType)
    } 
  }


  async function saveLogOnline(logContent, logType) {
    try{
      const res = await axios.post(`${API_BASE_URL}/users/${currentUser.userId}/history`, {
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
          console.log(e.message)   // if not from server, directly get message ( accessing non-existenece end point for exmaple)
        }
      }
      else{  // for other errors (type error and some shit, when the axios request does not get through)
        console.log(e)
      }   
    }  
  }

  async function saveLog(logContent, logType) {
    try {
      const response = await window.electron.createLog({
        token,
        userId : currentUser.id,
        logContent, 
        createdAt : DateTime.now().toLocaleString(DateTime.DATETIME_FULL),
        logType 
      })
      console.log(response.message)
     
    }
    catch(e) {
      console.log(e)
    }
  }

  async function logoutOnline() {
    try{
      const response =  await axios.post(`${API_BASE_URL}/auth/logout`)
      setCurrentUser(null)
      // window.localStorage.removeItem('userData')
      // window.localStorage.removeItem('tokenExpirationTime')
      //await db.notes.clear();
      setNotes(null)
      //queryClient.removeQueries(['notes']);
      showAlert(response.data.message, "success")
    }
    catch(e) {
      console.log(e.response.data.message)
    }    
  }

  async function logoutOffline() {
  
    try{
      const response = await window.electron.logoutUser(currentUser.id)
      console.log( response.message)
      clearToken()

    }catch(e) {
      console.log(e)
    } 
  }


    return (
        <GlobalContext.Provider
        value={{
            currentUser,
            setCurrentUser,
            token,
            setToken,
            clearToken,
            isLoading,
            getUserDetails,
            getUserDetailsOnline,
            getNotesOnline,
            notes,
            setNotes,
            logoutOnline,
            logoutOffline,
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
