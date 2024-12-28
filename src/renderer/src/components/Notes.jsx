import { useContext, useEffect, useState } from "react";
import "./../styles/Notes.scss"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
  } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";



export default function Notes() {

    const {currentUser, token} = useContext(GlobalContext);
    const navigate = useNavigate()
    const [open, setOpen] = useState(false); // State to control modal visibility
    const [noteName, setNoteName] = useState(''); // State to store the note name
    const [notes, setNotes] = useState(null)
  
    const handleOpen = () => setOpen(true); // Open modal
    const handleClose = () => {
        setNoteName('')
        setOpen(false); // Close modal
    }
    const handleSave = () => {
      setOpen(false);
      navigate('/createNote', { state: { noteName } })
    }
    //console.log(noteName)

    async function getNotes(userId) {

      try{
        const response = await window.electron.fetchNotes(userId);
        if (response.length >  0) {
          //console.log(response)
          setNotes(response)
        }
        else{
          setNotes(null)
        }
      }
      catch(e) {
        console.log(e)
      }
    }


    useEffect(()=>{
      if(currentUser) {
        getNotes(currentUser.id)
      }
      console.log('notes effect')

    },[currentUser])


    async function deleteNote (noteId) {
      console.log()
      try{
        const response = await window.electron.deleteNote(token, noteId, currentUser.id);
        // console.log('noteId:', noteId, 'Type:', typeof noteId);
        // console.log('userId:', currentUser.id, 'Type:', typeof currentUser.id);
        console.log(response.message)
        getNotes(currentUser.id)
      }
      catch(e) {
        console.log(e)
      }
    }

    return (
        <div className="notes-page">
            <div>
                <input placeholder="Search your notes"></input>
            </div>
            <Button variant="contained" color="primary" onClick={handleOpen}>
                    Add Note
            </Button>
            <div className="notes">
              {
                notes? (
                  notes.map((note, index) => (
                    <div className="note-card" key={index}>
                      <div className="note-header">
                          <h3>{note.name}</h3>
                          <span className="note-date">Nov 30, 2024</span>
                      </div>
                      <div className="note-body">
                        <div dangerouslySetInnerHTML={{ __html: note.content }} />
                      </div>
                      <div className="note-footer">
                        <Link to={`/editNote/${note.id}`} state={note}> <button className="edit-btn">Edit</button></Link>
                          <button className="delete-btn" onClick={()=> deleteNote(note.id)}>Delete</button>
                      </div>
                  </div>
                  ))
                ) 
                : (<div>lol</div>)
              }
                
            </div> 
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
              <Button onClick={handleSave} color="primary">
                Save
              </Button>
            </DialogActions>
            </Dialog> 
        </div>
    )
}
