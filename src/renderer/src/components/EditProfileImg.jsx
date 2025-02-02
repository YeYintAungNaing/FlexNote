import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import "../styles/EditProfileImg.scss"
import axios from "axios";


export default function EditProfileImg() {

    const [file, setFile] = useState("")
    const {currentUser, token, getUserDetails, getUserDetailsOnline,  setProfileImg } = useContext(GlobalContext);
    const MAX_FILE_SIZE =  7 * 1024 * 1024
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
        console.log('Only allow file size under 7mb')
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
        const response = await axios.get("http://localhost:7000/generateSignature");
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

        
        const res = await axios.put(`http://localhost:7000/users/${currentUser.userId}/profileImage`, {
          image_url : resObj.url
        })
        await getUserDetailsOnline()    // get updated user details
        setProfileImg(null)
        setFile('')
        console.log(res.data.message)
       }

      catch(e){
        if(e.response) {
          console.log(e.response.data.message)
        }
        else {
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

            await getUserDetails()    // get updated user details
            setProfileImg(null)
            setFile('')
            console.log(response.message)
          }    
        }
        catch(e) {
          console.log(e)
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


