import MenuBar from './TiptapConfig'
import {extensions} from './TiptapConfig'
import './../styles/NoteEditor.scss'
import { EditorProvider} from '@tiptap/react'
import { useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';


export default function EditNote() {
  const location = useLocation();

  const [noteName, setNoteName] = useState(location.state.name ? location.state.name : null )
  const [content, setContent] = useState(location.state.content ? location.state.content : null )
  const {currentUser, token, showAlert} = useContext(GlobalContext);
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true); // Open modal
  const handleClose = () => {
        setNoteName(location.state.name ? location.state.name : null)
        setOpen(false); // Close modal
  }


  async function editNote() {

    try{
      const response = await window.electron.editNote({
        token : token,
        content : content,
        noteId : location.state.id,
        userId : currentUser.id 
       })
       //console.log(response.message)
       showAlert(response.message, 'success')
    }catch(e) {
      console.log(e)
    }  
  }

  async function editNoteName() {
    try{
      const response = await window.electron.editNoteName({
        token : token,
        noteName : noteName,
        noteId : location.state.id,
        userId : currentUser.id 
       })

       if (response.message) {
        console.log(response.message)
       }
       else{
        setNoteName(location.state.name)
        console.log(response.error)
       }
       
       setOpen(false)
    }catch(e) {
      console.log(e)
    }
  }
  //console.log(window.location.href)

  return (
    <div>
      {
        currentUser?  (
          <div> 
            <h2>{noteName}</h2>
            <button onClick={handleOpen}>Edit name</button>
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
            <button onClick={editNote}>Edit note</button>
            <EditorProvider  
              slotBefore={<MenuBar />} 
              extensions={extensions} 
              content={content}
              onUpdate={({ editor }) => setContent(editor.getHTML())}>
            </EditorProvider>
          </div> 
        ) : (
          <div> empty </div>
        )
      } 
    </div>
  )
}
    