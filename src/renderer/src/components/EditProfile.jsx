import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import { Dns } from "@mui/icons-material";
import { useRadioGroup } from "@mui/material";

export default function EditProfile() {

    const {currentUser, token} = useContext(GlobalContext);
    const [userName, setUserName] =useState(currentUser?.userName || '') 
    const [dName, setdName] =useState(currentUser?.dName || '') 
    const [email, setEmail] =useState(currentUser?.email || '') 
    const [gender, setGender] =useState(currentUser?.gender || '')
    const [location, setLocation] =useState(currentUser?.gender || '')

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
                <input value={location} onChange={(e) => setLocation(e.target.value) } ></input>
            </div> 
            <div>
                <button onClick={changeProfileDetails}>submit</button>
            </div> 
        </div>
    )

}