import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import {  Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import "./../styles/Profile.scss"
import luna from "../assets/luna.jpeg"

export default function Profile() {

    const navigate = useNavigate()

    const {currentUser, clearToken} = useContext(GlobalContext);
    // function current() {
    //   try{
    //     const token = window.localStorage.getItem('sessionToken');
    //     console.log(token)
    //   }catch(e) {
    //       console.log(e)
    //     }
    //   }
    //console.log(currentUser)
  
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
      <div className="profile">
        {
          currentUser? (
            <div>
              <div className="profile-photo">
                  <img  onClick={()=> navigate('editProfileImg')} src={luna} alt=""></img> 
                  <p>{currentUser.dName || currentUser.userName}</p> 
              </div>
              <div className="profile-info">
                  <div className="info-1">
                  <table>
                    <tbody>
                      <tr>
                        <td colSpan="2" className="table-caption">Personal Details</td>
                      </tr>
                      <tr>
                        <th >Name</th>
                        <td>{currentUser.userName}</td>
                      </tr>
                      <tr>
                        <th >Gmail</th>
                        <td>{currentUser.email || 'None'}</td>
                      </tr>
                      <tr>
                        <th >Location</th>
                        <td>{currentUser.location || 'None'} </td> 
                      </tr>
                      <tr>
                        <th >Gender</th>
                        <td>{currentUser.gender|| 'None'}</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                  <div className="info-2">
                  <table>
                    <tbody>
                      <tr>
                        <td colSpan="2" className="table-caption">Account Details</td>
                      </tr>
                      <tr>
                        <th >Display Name</th>
                        <td>YeYe</td>
                      </tr>
                      <tr>
                        <th >Mode</th>
                        <td>Offline</td>
                      </tr>
                      <tr>
                        <th >Account Created</th>
                        <td>YeYe </td>  
                      </tr>
                      <tr>
                        <th >Premium</th>
                        <td>No</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
              </div> 
              <div className="logout">
                <Link to='/editProfile'><button>Edit</button></Link> 
                <button onClick={logoutUser}>Logout</button>
              </div> 
              
            </div>
          ):(
            <Login></Login>
          )
        }  
      </div>
    )
}
