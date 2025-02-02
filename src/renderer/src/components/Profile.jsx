import { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import {  Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import "./../styles/Profile.scss"
import axios from 'axios'
import coverImage from "../assets/cover.jpg"


export default function Profile() {

    const navigate = useNavigate()

    const {currentUser,setCurrentUser, clearToken, fetchProfileImage, profileImg } = useContext(GlobalContext);
    // function current() {
    //   try{
    //     const token = window.localStorage.getItem('sessionToken');
    //     console.log(token)
    //   }catch(e) {
    //       console.log(e)
    //     }
    //   }
    //console.log(currentUser)

    // console.log(currentUser?.profileImgPath)

    function logout() {
      if (currentUser.mode === 'Offline') {
        logoutOffline()
      }
      else{
        logoutOnline()
      }
    }
  
    async function logoutOffline() {
  
      try{
        const response = await window.electron.logoutUser(currentUser.id)
        console.log( response.message)
        clearToken()
        navigate('/')
  
      }catch(e) {
        console.log(e)
      } 
    }
    //console.log(profileImg)

    async function logoutOnline() {
      try{
        const response =  await axios.post('http://localhost:7000/auth/logout')
        setCurrentUser(null)
        console.log(response.data.message)
      }
      catch(e) {
        console.log(e.response.data.message)
      }
        
    }

    useEffect(() => { 
      if (profileImg) {
        return
      }
      fetchProfileImage()  // this set a new profileImg state  
      console.log('profile img fetched') 
    }, [currentUser]);   // in case currentUser is not updated in time when this useEffect takes place ( re-trigger the useeffect)
     

    return (
      <div className="profile">
        {
          currentUser? (
            <div>
              <div className="profile-photo" style={{ backgroundImage: `url(${coverImage})` }} >
                  <img  onClick={()=> navigate('/editProfileImg')} src={profileImg} alt=""></img> 
                  <p>{currentUser.dName || currentUser.userName}</p>
                  <p>{currentUser.email || currentUser.email}</p>
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
                        <td>{currentUser.mode}</td>
                      </tr>
                      <tr>
                        <th >Account Created</th>
                        <td>{currentUser.createdAt || 'None'} </td>  
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
                <button onClick={logout}>Logout</button>
              </div> 
            </div>
          ):(
            <Login></Login>
          )
        }  
      </div>
    )
}
