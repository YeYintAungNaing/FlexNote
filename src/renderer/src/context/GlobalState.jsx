import { useEffect, useState } from "react";
import { createContext } from "react";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';


export const GlobalContext = createContext(null);

// eslint-disable-next-line react/prop-types
export default function GlobalState({children}) {

    const [currentUser, setCurrentUser] = useState(null)
    const [token, setToken] = useState(() => window.localStorage.getItem('sessionToken'));  // lazy initializaiton instead of straight up call, 
    //const navigate = useNavigate()
    console.log("from global state",currentUser)

    async function verifyToken() {
    
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


    useEffect(() => {
        verifyToken()

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


    return (
        <GlobalContext.Provider
        value={{
            currentUser,
            setCurrentUser,
            token,
            clearToken,
            verifyToken,
            showAlert
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
