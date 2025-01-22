
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import GlobalState from './context/GlobalState'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalState>
      
      <BrowserRouter> 
        <App /> 
      </BrowserRouter>
      
    </GlobalState>
  </React.StrictMode>
)
