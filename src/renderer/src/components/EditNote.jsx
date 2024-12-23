import MenuBar from './TiptapConfig'
import {extensions} from './TiptapConfig'
import './../styles/NoteEditor.scss'
import { EditorProvider} from '@tiptap/react'
import { useLocation } from 'react-router-dom';

import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';

export default function EditNote() {
  const location = useLocation();

  const [noteName, setNoteName] = useState(location.state.name ? location.state.name : null )
  const [content, setContent] = useState(location.state.content ? location.state.content : null )
  const {currentUser} = useContext(GlobalContext);


  async function editNote() {

    try{
      const response = await window.electron.editNote({
        content : content,
        noteId : location.state.id,
        userId : currentUser.id 
       })
       console.log(response.message)
    }catch(e) {
      console.log(e)
    }
    
  }

  return (
    <div>
      {
        currentUser?  (
          <div> 
            <h2>{noteName}</h2>
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
    