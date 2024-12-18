import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import { useNavigate } from "react-router-dom";

export default function Setting() {

  const navigate = useNavigate()

  const {currentUser, setCurrentUser} = useContext(GlobalContext);
  function current() {
    try{
      const token = window.localStorage.getItem('sessionToken');
      console.log(token)
    }catch(e) {
        console.log(e)
      }
    }


  async function logoutUser() {

    try{
      const response = await window.electron.logoutUser(currentUser.id)
      console.log( response.message)
      setCurrentUser(null)
      localStorage.removeItem('sessionToken')
      navigate('/')

    }catch(e) {
      console.log(e)
    } 
  }

    
  return (
    <div>
      {
        currentUser && <button onClick={logoutUser}>Logout</button>
      }
      
      <button onClick={current}>Current token</button>
    </div>
  )
}
