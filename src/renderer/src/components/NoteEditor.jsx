import './../styles/NoteEditor.scss'
import { EditorProvider} from '@tiptap/react'
import { useContext, useState } from 'react'
//import { useState } from 'react'
import { isRouteErrorResponse, useLocation } from 'react-router-dom'
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


export default function NoteEditor() {
  
  const location = useLocation();
  const {currentUser, token} = useContext(GlobalContext);
  const [noteName, setNoteName] = useState(location.state || "Default")
  const [content, setContent] = useState('')
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true); // Open modal
  const handleClose = () => {
        setNoteName('Default')
        setOpen(false); // Close modal
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
        console.log(response.error)
      }
      else{
        console.log(response.message)
      }
      
    }catch(e) {
      console.log(e)
    }    
  }

  // function test() {
  //   console.log('test')
  // }
  function editNoteName() {
    setOpen(false)
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
        <h2 onClick={handleOpen} className='note-title-btn'>{noteName}</h2>
        <button onClick={saveNote}>save</button>
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

