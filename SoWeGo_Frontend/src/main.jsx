import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
// 🛡️ THE MISSING LINK: Import the AuthProvider here
import { AuthProvider } from './context/AuthContext' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🛡️ Wrap the App so every page can see the "currentUser" */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)