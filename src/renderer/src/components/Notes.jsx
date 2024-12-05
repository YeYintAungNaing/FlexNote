import { useState } from "react";
import "./../styles/Notes.scss"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
  } from '@mui/material';
import { useNavigate } from "react-router-dom";



export default function Notes() {
    const navigate = useNavigate()

    const [open, setOpen] = useState(false); // State to control modal visibility
    const [noteName, setNoteName] = useState(''); // State to store the note name
  
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

    return (
        <div className="notes-page">
            <div>
                <input placeholder="Search your notes"></input>
            </div>
            <Button variant="contained" color="primary" onClick={handleOpen}>
                    Add Note
            </Button>
            <div className="notes">
                <div className="note-card">
                    <div className="note-header">
                        <h3>Note Title</h3>
                        <span className="note-date">Nov 30, 2024</span>
                    </div>
                    <div className="note-body">
                        <p>This is a sample content for the note card. Add your note details here.</p>
                    </div>
                    <div className="note-footer">
                        <button className="edit-btn">Edit</button>
                        <button className="delete-btn">Delete</button>
                    </div>
                </div>
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
