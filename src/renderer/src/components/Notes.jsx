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
import axios from 'axios'



export default function Notes() {

    const {currentUser, token, alertAndLog} = useContext(GlobalContext);
    const navigate = useNavigate()
    const [open, setOpen] = useState(false); // State to control modal visibility
    const [noteName, setNoteName] = useState(''); // State to store the note name
    const [notes, setNotes] = useState(null)
    const [searchParams, setSearchParams] = useState('')
    const [searchResults, setSearchResults] = useState(null)
  
    const handleOpen = () => setOpen(true); // Open modal
    const handleClose = () => {
        setNoteName('')
        setOpen(false); // Close modal
    }
    const handleSave = () => {
      setOpen(false);
      navigate('/createNote', { state: noteName })
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

    async function  getNotesOnline() {
      try{
          const response = await axios.get('http://localhost:7000/notes')
          
          if (response.data.length >  0) {
            setNotes(response.data)
            
          }
          else{
            setNotes(null)
          }

      }
      catch(e) {
        if(e.response) {
          console.log(e.response.data.message)
        }
        else {
          console.log(e)
        }
      }
    }

    useEffect(()=>{
      
      if(currentUser) {

        if(currentUser.mode === "Online") {
          getNotesOnline()  
        }
        else{
          getNotes(currentUser.id)
        }
      }
      console.log('notes effect')

    },[currentUser])

    function searchNotes() {
      if (searchParams.length < 3 ) {
        console.log('at least 3 characters')
        return
      }
      const result = notes.filter((note) => note.content.toLowerCase().includes(searchParams.toLowerCase()))
      setSearchResults(result)
    }


    function delete_(noteId) {
      if (currentUser.mode === "Offline") {
        deleteNote(noteId)
      }
      else{
        deleteNoteOnline(noteId)
      }
    }

    async function deleteNoteOnline(noteId) {
      console.log(noteId)
      try{
        const response = await axios.delete(`http://localhost:7000/notes/${noteId}`)
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
    
    
    async function deleteNote (noteId) {
      //console.log()
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
            <div className="search">
                <input 
                  value={searchParams} 
                  onChange={(e) => setSearchParams(e.target.value)} 
                  placeholder="Search your notes"
                  >
                </input>
                <button onClick={searchNotes}>search</button>
                <button className="clear" onClick={() => setSearchResults(null)}>clear results</button>
            </div>
            <Button className="floating-btn" variant="contained" color="primary" onClick={handleOpen}>
              Add note
            </Button>
            <div className="notes">
              {
                notes? (
                  searchResults? (
                    searchResults.map((note, index) => (
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
                              <button className="delete-btn" onClick={()=> delete_(note.id)}>Delete</button>
                          </div>
                        </div>
                      ))
                    ) 
                    : (
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
                              <button className="delete-btn" onClick={()=> delete_(note.id)}>Delete</button>
                          </div>
                        </div>
                      ))
                    ) 
                  ): (<div>lol</div>)
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
