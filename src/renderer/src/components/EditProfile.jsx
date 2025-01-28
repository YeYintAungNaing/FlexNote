import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
//import { GlobalAlertContext } from "../context/AlertContext";
import { CountryDropdown } from 'react-country-region-selector';
import "../styles/EditProfile.scss"
import axios from 'axios'

export default function EditProfile() {

    const {currentUser, token, getUserDetails, getUserDetailsOnline, showAlert} = useContext(GlobalContext);
    //const {showAlert} = useContext(GlobalAlertContext);
    const [userName, setUserName] =useState(currentUser?.userName || '') 
    const [dName, setdName] =useState(currentUser?.dName || '') 
    const [email, setEmail] =useState(currentUser?.email || '') 
    const [gender, setGender] =useState(currentUser?.gender || '')
    const [location, setLocation] =useState(currentUser.location || '')
    //console.log(userName, dName, email, gender, location)

    async function editProfile() {
        try{
            const response = await window.electron.editProfile({
                userName,
                dName,
                email,
                gender,
                location,
                token,
                userId : currentUser.id
            })

            console.log(response.message)

        }catch(e) {
            console.log(e)
        }
        await getUserDetails()
        showAlert('successfully edited profile', 'success')   
    }

    async function editProfileOnline() {
        try{
            const response = await axios.put(`http://localhost:7000/users/${currentUser.userId}`, {
                userName,
                dName,
                email,
                gender,
                location, 
            })
            console.log(response.data.message)
        }catch(e) {
            if(e.response) {
                console.log(e.response.data.message)
            }
            else {
                console.log(e)
            }
        }
        await getUserDetailsOnline()
        showAlert('successfully edited profile', 'success') 
    }

    function changeProfileDetails() {
        if (currentUser.mode === "Offline") {
            editProfile()
        }
        else{
            editProfileOnline()
        }
    }

  
    return (
        <div className="edit-profile"> 
            <div>
                <p>Name</p>
                <input value={userName} onChange={(e) => setUserName(e.target.value) }></input>
            </div>
            <div>
                <p>Display Name</p>
                <input value={dName} onChange={(e) => setdName(e.target.value) } ></input>
            </div>
            <div>
                <p>Email</p>
                <input value={email} onChange={(e) => setEmail(e.target.value) } ></input>
            </div>
            <div>
                <p>Gender</p>
                <input value={gender} onChange={(e) => setGender(e.target.value) } ></input>
            </div>
            <div>
                <p>Location</p>
                <CountryDropdown className="dropdown" value={location} onChange={(val) => setLocation(val) } />
            </div> 
            <div>
                <button onClick={changeProfileDetails}>submit</button>
            </div> 
            
        </div>
    )
}