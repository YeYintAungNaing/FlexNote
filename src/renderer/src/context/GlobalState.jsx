import { useEffect, useState } from "react";
import { createContext } from "react";



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
            }
            else{
              console.log('invalid token')
              localStorage.removeItem('sessionToken')
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


    return (
        <GlobalContext.Provider
        value={{
            currentUser,
            setCurrentUser,
            token,
            clearToken  
        }}>
            {children}
        </GlobalContext.Provider>
    )
}
