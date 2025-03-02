import { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import {  Link, useNavigate } from "react-router-dom";
import "./../styles/Profile.scss"
import axios from 'axios'
import coverImage from "../assets/cover.jpg"
import { useQueryClient } from '@tanstack/react-query';


export default function Profile() {

    const navigate = useNavigate()
    const queryClient = useQueryClient();

    const {currentUser,setCurrentUser, isLoading, clearToken, fetchProfileImage, profileImg, setProfileImg } = useContext(GlobalContext);

    function logout() {
      setProfileImg(null)
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
        window.localStorage.removeItem('userData')
        window.localStorage.removeItem('tokenExpirationTime')
        
        queryClient.removeQueries(['notes']);
        console.log(response.data.message)
      }
      catch(e) {
        console.log(e.response.data.message)
      } 
    }
    //console.log(profileImg)

    useEffect(() => { 
      //console.log('useeffect')
      if (!currentUser && !isLoading){
        navigate('/login')
        
      }
      if (profileImg || !currentUser ) {
        return
      }
      //console.log('effect')
      fetchProfileImage()  // this set a new profileImg state  
      //console.log('profile img fetched') 
    }, [currentUser, isLoading]);   // in case currentUser is not updated in time when this useEffect takes place ( re-trigger the useeffect)
    
   
    //console.log('outside')
    return (
      <div className="profile">
        {
          currentUser && !isLoading ? (
            <div>
              <div className="profile-photo" style={{ backgroundImage: `url(${coverImage})` }} >
                  <img  onClick={()=> navigate('/editProfileImg')} src={profileImg} alt=""></img> 
                  <p>{currentUser.dName || currentUser.userName}</p>
                  <p className="email">{currentUser.email || currentUser.email}</p>
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
              <div className="buttons_">
                <Link to='/editProfile'><button>Edit profile details</button></Link> 
                {
                  currentUser.mode === "Online" &&  <Link to='/passwordReset' ><button>Reset passoword</button></Link> 
                }
                <button className="logout" onClick={logout}>Logout</button>
              </div> 
            </div>
          ):(
            <div>Loading...</div>
          )
        }  
      </div>
    )
}
