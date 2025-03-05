import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import "../styles/EditProfileImg.scss"
import axios from "axios";
import { API_BASE_URL } from "../config";


export default function EditProfileImg() {

    const [file, setFile] = useState("")
    const { currentUser, 
            token, 
            getUserDetails, 
            getUserDetailsOnline,  
            setProfileImg, 
            showAlert, 
            alertAndLog 
          } = useContext(GlobalContext);
    const MAX_FILE_SIZE =  5 * 1024 * 1024
    const allowedFileTypes = ["image/jpeg", "image/png"]
    
    //const [previewImg, setPreviewImg] = useState()
    //console.log(file)

    async function upload() {
      if (!file) {
        console.log('empty')
        return
      }

      if (!allowedFileTypes.includes(file.type)) {
        console.log("Image has to be in JPEG and PNG format")
        return
      }

      if (file.size > MAX_FILE_SIZE ) {
        console.log('Only allow file size under 5mb')
        setFile("")
        return
      }

      if (currentUser.mode === "Offline") {
        uploadOffline()
      }
      else{
        uploadOnline()
      }
    }

    async function uploadOnline() { 
      if (!file) {
          console.log('kek')
          return
      }
      try{
        const response = await axios.get(`${API_BASE_URL}/generateSignature`);
        //console.log(response.data)
        const { signature, timestamp, cloud_name, api_key } = response.data
    
        const formData = new FormData();
        formData.append("file", file);
        formData.append("timestamp", timestamp);
        formData.append("api_key", api_key);
        formData.append("signature", signature);
        formData.append("folder", "profile_images");
    
        const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
            method: "POST",
            body: formData
        });
        const resObj =  await cloudinaryResponse.json()
        //console.log(resObj.url)

        
        const res = await axios.put(`${API_BASE_URL}/users/${currentUser.userId}/profileImage`, {
          image_url : resObj.secure_url
        })
        await getUserDetailsOnline()    // get updated user details
        setProfileImg(null)
        setFile('')
        //console.log(res.data.message)
        alertAndLog(res.data.message, 'success')
       }

      catch(e){
        if(e.response) {   
          if(e.response.data.ServerErrorMsg) {  
            //console.log(e.response.data.ServerErrorMsg)
            alertAndLog(e.response.data.ServerErrorMsg, "error")
          }
          else {
            //console.log(e.message)   
            alertAndLog(e.message, "error")
          }
        }
        else{  
          console.log(e)
        } 
      }
    }

    async function uploadOffline() {
        
        try{
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          reader.onload = async () => {
            const arrayBuffer = reader.result;
    
            // console.log(file.name)
            // console.log(arrayBuffer)
    
            const response = await window.electron.uploadImg({  // this save the img in the relevant user directory and store that new file path string in db 
              fileName: file.name,
              fileData: arrayBuffer,
              token,
              userId : currentUser.id
            });

            if (response.error) {
              alertAndLog(response.error, "error")
            }
            else{
              await getUserDetails()    // get updated user details
              setProfileImg(null)
              setFile('')
              alertAndLog(response.message, 'success')
            }
          }    
        }
        catch(e) {
          showAlert('Unexpected error occurs', "error")
        }
    }


    async function selectImage(e) {
      setFile(e.target.files[0])
    }

    return (
        <div className="edit-profile-img">  
          <div className="select-file">
            <input style={{display : 'none'}} type='file' id='imgFile' name='' onChange={selectImage}></input>
            <button>
              <label htmlFor='imgFile'>Select Image</label>
            </button>
            <div>{file? file.name : "No file chosen"}</div> 
          </div>   
          <button onClick={upload}>Change profile image</button>    
        </div>
    )
}


