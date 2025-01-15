import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
//import { GlobalAlertContext } from "../context/AlertContext";
import { CountryDropdown } from 'react-country-region-selector';


export default function EditProfile() {

    const {currentUser, token, verifyToken, showAlert} = useContext(GlobalContext);
    //const {showAlert} = useContext(GlobalAlertContext);
    const [userName, setUserName] =useState(currentUser?.userName || '') 
    const [dName, setdName] =useState(currentUser?.dName || '') 
    const [email, setEmail] =useState(currentUser?.email || '') 
    const [gender, setGender] =useState(currentUser?.gender || '')
    const [location, setLocation] =useState(currentUser.location || '')
    //console.log(userName, dName, email, gender, location)

    async function changeProfileDetails() {
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
        await verifyToken()
        showAlert('successfully edited profile', 'success')   
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
                <CountryDropdown value={location} onChange={(val) => setLocation(val) } />
            </div> 
            <div>
                <button onClick={changeProfileDetails}>submit</button>
            </div> 
            
        </div>
    )
}