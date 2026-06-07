import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() {
    console.info('A new version is available. Refresh to update.')
  },
  onOfflineReady() {
    console.info('App is ready for offline use.')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
