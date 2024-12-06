import './../styles/NoteEditor.scss'
import { EditorProvider} from '@tiptap/react'
import { useState } from 'react'
//import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import MenuBar from './TiptapConfig'
import {extensions} from './TiptapConfig'


export default function NoteEditor() {
  
  const location = useLocation();
  const { noteName } = location.state || {noteName : 'Default'};
  const [content, setContent] = useState('')
  //let content = 'Enter your note here'

  async function saveNote() {

    try{
      const response = await window.electron.saveNote({
        noteName : noteName,
        content : content
       })
      console.log('saved with ID', response.id)
    }catch(e) {
      console.log(e)
    }    
  }


  return (
    <>
      <h2>{noteName}</h2>
      <button onClick={saveNote}></button>
      <EditorProvider  
        slotBefore={<MenuBar />} 
        extensions={extensions} 
        content={content}
        onUpdate={({ editor }) => setContent(editor.getHTML())}>
      </EditorProvider>
    </>
  )
}
