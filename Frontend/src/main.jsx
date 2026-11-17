import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import 'lenis/dist/lenis.css'

import App from './App.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import SmoothScroll from './components/layout/SmoothScroll.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <SmoothScroll />
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
