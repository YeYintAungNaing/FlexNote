import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import { useNavigate } from "react-router-dom";
import '../styles/Setting.scss'


export default function Setting() {

   const navigate = useNavigate()
  //const [data, setData] = useState("")

 const {alertAndLog, showAlert, currentUser, setCurrentUser} = useContext(GlobalContext);
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
      
  // //   }

  // const MAX_FILE_SIZE =  7 * 1024 * 1024

  // function  selectImage(e) {
  //   setData(e.target.files[0])
  // }

  // function getDetails() {
  //   if (!data) {
  //     return
  //   }
  //   if (data.size > MAX_FILE_SIZE ) {
  //     console.log('Only allow file size under 7mb')
  //     return
  //   }
  //   console.log('submitted')
  // }

  function save() {
    setCurrentUser({...currentUser, secret : '123'})
  }

  function save1() {
    setCurrentUser({...currentUser, secret2 : 'zzzz'})
  }

  function turnoff() {
    setCurrentUser({...currentUser, mode : 'sss'})
  }
  function turnOn() {
    setCurrentUser({...currentUser, mode : 'Online'})
  }

  function alertt() {
    //setProfileImg('5555')
    showAlert('dddd', "error")
  }

  console.log("setting render")


  //console.log('setting_rendered')

    
  return (
    <div className="setting">
      <div>
        <h2>this page is for testing </h2>
        <button onClick={save}>change current user</button>
        <button onClick={save1}>change current user_</button>
        <button onClick={turnoff}>off</button>
        <button onClick={turnOn}>on</button>
        
        <button onClick={() => { navigate('/logs')}}></button>
        <button onClick={alertt}>Alert</button>
      </div>
        
        <button onClick={() => alertAndLog('test', 'success')}></button>
    </div>
  )
}
