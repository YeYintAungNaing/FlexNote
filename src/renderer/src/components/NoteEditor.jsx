import './../styles/NoteEditor.scss'
import { EditorProvider} from '@tiptap/react'
import { useContext, useState } from 'react'
//import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import MenuBar from './TiptapConfig'
import {extensions} from './TiptapConfig'
import { GlobalContext } from '../context/GlobalState'


export default function NoteEditor() {
  
  const location = useLocation();
  const {currentUser} = useContext(GlobalContext);
  const { noteName } = location.state || {noteName : 'Default'};
  const [content, setContent] = useState('')
  //let content = 'Enter your note here'

  async function saveNote() {

    try{
      const response = await window.electron.saveNote({
        noteName : noteName,
        content : content,
        userId : currentUser.id 
       })
      //console.log('saved with ID', response.id)
      console.log(response.message)
    }catch(e) {
      console.log(e)
    }    
  }


  return (
    <>
      <h2>{noteName}</h2>
      <button onClick={saveNote}>save</button>
      <EditorProvider  
        slotBefore={<MenuBar />} 
        extensions={extensions} 
        content={content}
        onUpdate={({ editor }) => setContent(editor.getHTML())}>
      </EditorProvider>
    </>
  )
}
