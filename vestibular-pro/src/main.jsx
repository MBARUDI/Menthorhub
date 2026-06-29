import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { VestibularProvider } from './context/VestibularContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VestibularProvider>
      <App />
    </VestibularProvider>
  </StrictMode>,
)
