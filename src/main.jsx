import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initSentry, SentryErrorBoundary } from './sentry.js'

initSentry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SentryErrorBoundary fallback={<div>Something went wrong.</div>}>
      <App />
    </SentryErrorBoundary>
  </StrictMode>,
)
