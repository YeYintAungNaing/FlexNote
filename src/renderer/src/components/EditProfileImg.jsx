import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import "../styles/EditProfileImg.scss"

export default function EditProfileImg() {

    const [file, setFile] = useState("")
    const {currentUser, token, getUserDetails,  setProfileImg } = useContext(GlobalContext);
    
    //const [previewImg, setPreviewImg] = useState()

    // THIS method need express ( will implement later)
    // async function upload() { 
    //     if (!file) {
    //         console.log('kek')
    //         return
    //     }
    //     try{
    //       const formData = new FormData();
    //       formData.append("file", file)
    //       console.log(formData)
    //       //console.log(res)
    //       //return res.data
    //     }
    //     catch(err){
    //       console.log(err)
    //     }
    //   }
    //console.log(file)

    async function upload() {
        if (!file) {
          console.log('empty')
          return
        }

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
            //await fetchProfileImage()  // instantly change the profile image
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


// const handleFileUpload = async (event) => {
//   const file = event.target.files[0]; // Get selected file
//   if (!file) return;

//   // Convert file to base64 or send file path
//   const reader = new FileReader();
//   reader.readAsArrayBuffer(file);
//   reader.onload = async () => {
//     const arrayBuffer = reader.result;

//     // Send to Electron main process via IPC
//     const savedFilePath = await window.electron.uploadFile({
//       fileName: file.name,
//       fileData: arrayBuffer
//     });

//     console.log("Saved file at:", savedFilePath);
//   };
// };

// return (
//   <input type="file" onChange={handleFileUpload} />
// );


// const { ipcMain } = require('electron');
// const fs = require('fs');
// const path = require('path');

// ipcMain.handle('uploadFile', async (_, { fileName, fileData }) => {
//     try {
//         const uploadPath = path.join(__dirname, 'uploads'); // Folder to store images
//         if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath); // Create folder if not exists

//         const filePath = path.join(uploadPath, fileName);
//         fs.writeFileSync(filePath, Buffer.from(fileData)); // Save file

//         return filePath; // Return saved path to frontend
//     } catch (err) {
//         console.error("File upload error:", err);
//         throw err;
//     }
// });


// db.run("INSERT INTO notes (image_path) VALUES (?)", [savedFilePath], (err) => {
//   if (err) console.error(err);
//   console.log("File path stored successfully");
// });

