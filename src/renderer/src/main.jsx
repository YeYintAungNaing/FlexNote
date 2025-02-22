
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import GlobalState from './context/GlobalState'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <QueryClientProvider client={queryClient}>
    <GlobalState>
      
      <BrowserRouter> 
        <App /> 
      </BrowserRouter>
      
    </GlobalState>
    </QueryClientProvider>
  </>
)
