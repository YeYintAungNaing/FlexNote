import { useEffect, useState } from "react";
import { createContext } from "react";


export const GlobalContext = createContext(null);

// eslint-disable-next-line react/prop-types
export default function GlobalState({children}) {

    const [currentUser, setCurrentUser] = useState(null)

    console.log("from global state",currentUser)

    async function verifyToken() {
    
        try{
          const token = window.localStorage.getItem('sessionToken');
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


    return (
        <GlobalContext.Provider
        value={{
            currentUser,
            setCurrentUser,
          
        }}>
            {children}
        </GlobalContext.Provider>
    )
}
