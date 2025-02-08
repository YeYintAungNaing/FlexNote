import './../styles/NoteEditor.scss'
import { EditorProvider} from '@tiptap/react'
import { useContext, useState } from 'react'
//import { useState } from 'react'
import MenuBar from './TiptapConfig'
import {extensions} from './TiptapConfig'
import { GlobalContext } from '../context/GlobalState'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useLocation } from 'react-router-dom'
import axios from 'axios'


export default function NoteEditor() {
  
  const location = useLocation();
  const {currentUser, token, showAlert, alertAndLog} = useContext(GlobalContext);
  const [noteName, setNoteName] = useState(location.state || "Default")
  const [content, setContent] = useState('')
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true); 
  const handleClose = () => {
        setNoteName('Default')
        setOpen(false); 
  }

  //let content = 'Enter your note here'

  async function saveNote() {

    try{
      const response = await window.electron.saveNote({
        token : token,
        noteName : noteName,
        content : content,
        userId : currentUser.id 
       })

      if (response.error) {
        //console.log(response.error)
        showAlert(response.error, 'error')
      }
      else{
        //console.log(response.message)
        showAlert(response.message, 'success')
      }
      
    }catch(e) {
      console.log(e)
    }    
  }

  async function saveNoteOnline() {
    try{
      const response = await axios.post('http://localhost:7000/notes', {
        noteName : noteName,
        content : content,
       })

       //console.log(response.data.message)
       alertAndLog(response.data.message, 'success')
    }
    catch(e) {
      if(e.response.data.ServerErrorMsg) {
        //console.log(e.response.data.ServerErrorMsg)
        alertAndLog(e.response.data.ServerErrorMsg, 'error')
    }
    else {
        //console.log(e.message)
        alertAndLog(e.message, 'error')
    }
    }
  }

  function editNoteName() {
    setOpen(false)
  }

  function save() {
    if (currentUser.mode === "Online") {
      saveNoteOnline()
    }
    else{
      saveNote()
    }
  }
 
  return (
    <>
    {
    currentUser? (
      <div>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Enter Note Name</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Note Name"
                type="text"
                fullWidth
                value={noteName}
                onChange={(e) => setNoteName(e.target.value)} // Update state
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button onClick={editNoteName} color="primary">
                Save
              </Button>
            </DialogActions>
            </Dialog>
            <div className='buttons'>
              <p onClick={handleOpen} className='note-title-btn'>{noteName}</p>
              <button className='save-note'  onClick={save}>Save Note</button>
            </div>
        <EditorProvider  
          slotBefore={<MenuBar />} 
          extensions={extensions}
          content={content}
          onUpdate={({ editor }) => setContent(editor.getHTML())}>
        </EditorProvider>
      </div>
    ) 
    : (<div>You must sign in first</div>)}
      
    </>
  )
}

