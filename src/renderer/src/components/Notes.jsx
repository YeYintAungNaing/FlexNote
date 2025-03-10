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
import { API_BASE_URL } from "../config";


export default function Notes() {

    const {currentUser, token, alertAndLog, showAlert, notes, setNotes, getNotesOnline} = useContext(GlobalContext);
    //const [notes, setNotes] = useState(onlineNotes)
    const navigate = useNavigate()
    const [open, setOpen] = useState(false); // State to control modal visibility
    const [noteName, setNoteName] = useState(''); // State to store the note name
    
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

    //console.log('rendered_')

    async function getNotes(userId) {
      //console.log('sssssssssssssssssssssssssssssssss')

      try{
        const response = await window.electron.fetchNotes(userId);
        if (response.length >  0) {
          //console.log(response)
          setNotes(response)
        }
        else if (response.error){
          showAlert(response.error, "error")
          setNotes(null)
        }
      }
      catch(e) {
        setNotes(null)
        showAlert("Unexpected error occurs", 'error')
      }
    }

    useEffect( ()=>{
      
      if(currentUser) {

        if (currentUser.mode === 'Offline') {
          getNotes(currentUser.id) 
        }
        else if(!notes) {
          console.log('d')
          //refetch()
          getNotesOnline()

        }   
      }
    },[currentUser])

    function searchNotes() {
      if (!notes) {
        console.log('empty notes')
        return
      }
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
        console.log('offline')
      }
      else{
        deleteNoteOnline(noteId)
      }
    }

    
    async function deleteNoteOnline(noteId) {
      //console.log(noteId)
      try{
        const response = await axios.delete(`${API_BASE_URL}/notes/${noteId}`)
        alertAndLog(response.data.message, 'success')
        //refetch()
        getNotesOnline()
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
      try{
        const response = await window.electron.deleteNote(token, noteId, currentUser.id);
        // console.log('noteId:', noteId, 'Type:', typeof noteId);
        // console.log('userId:', currentUser.id, 'Type:', typeof currentUser.id);
        if (response.error) {
          alertAndLog(response.error, "error")

        }
        else { 
          getNotes(currentUser.id)
          alertAndLog(response.message, "success")
        }
      }
      catch(e) {
        showAlert("Unexpected error occurs", 'error')
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
                currentUser && notes? (
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
                  ): (
                  <div className="empty-notes">
                    You have not created any note yet!
                  </div>
                  )
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
