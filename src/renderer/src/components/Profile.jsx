import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import {  useNavigate } from "react-router-dom";
import Login from "./Login";

export default function Profile() {

    const navigate = useNavigate()

    const {currentUser, clearToken} = useContext(GlobalContext);
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
        clearToken()
        navigate('/')
  
      }catch(e) {
        console.log(e)
      } 
    }
     
    return (
      <div>
        {
          currentUser? (
            <div>
                <button onClick={current}>Current token</button>
                <button onClick={logoutUser}>Logout</button>
            </div>
          ):(
            <Login></Login>
          )
        }  
      </div>
    )
}
