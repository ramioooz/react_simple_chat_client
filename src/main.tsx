import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SocketContext, socketIO } from './context/WebSocketContext.ts'



ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <SocketContext.Provider value={socketIO}>
    <App/>
  </SocketContext.Provider>
  // </React.StrictMode>,
)
