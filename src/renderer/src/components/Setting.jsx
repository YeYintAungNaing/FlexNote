// import { useContext } from "react";
// import { GlobalContext } from "../context/GlobalState";
//import { useNavigate } from "react-router-dom";

import { useState } from "react"

export default function Setting() {

  // const navigate = useNavigate()
  const [data, setData] = useState("")

  // const {currentUser, setCurrentUser} = useContext(GlobalContext);
  // function current() {
  //   try{
  //     const token = window.localStorage.getItem('sessionToken');
  //     console.log(token)
  //   }catch(e) {
  //       console.log(e)
  //     }
  //   }


  // async function logoutUser() {

  //   try{
  //     const response = await window.electron.logoutUser(currentUser.id)
  //     console.log( response.message)
  //     setCurrentUser(null)
  //     localStorage.removeItem('sessionToken')
  //     navigate('/')

  //   }catch(e) {
  //     console.log(e)
  //   } 
  // }
  
  // async function upload() { 
  //       if (!file) {
  //           console.log('kek')
  //           return
  //       }
  //       try{
  //         const formData = new FormData();
  //         formData.append("file", file)
  //         console.log(formData)
  //         const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
  //                     method: "POST",
  //                     body: formData
  //         });
  //       }
  //       catch(err){
  //         console.log(err)
  //       }
  //     }

  //   function selectImage() {
      
  //   }

  const MAX_FILE_SIZE =  7 * 1024 * 1024

  function  selectImage(e) {
    setData(e.target.files[0])
  }

  function getDetails() {
    if (!data) {
      return
    }
    if (data.size > MAX_FILE_SIZE ) {
      console.log('Only allow file size under 7mb')
      return
    }
    console.log('submitted')
    
  }

    
  return (
    <div>
        <input style={{display : 'none'}} type='file' id='imgFile' name='' onChange={selectImage}></input>
        <button>
          <label htmlFor='imgFile'>Select Image</label>
        </button>
        <button onClick={getDetails}>Get details</button>
    </div>
  )
}
