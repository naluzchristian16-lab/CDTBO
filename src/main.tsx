import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ✅ FIX: Import ErrorBoundary and seedData
import { ErrorBoundary } from './components/ErrorBoundary'
import { seedInitialData } from './db/seedData'

// ✅ FIX: Initialize seed data on app startup
// This populates IndexedDB with sample ingredients on first load
seedInitialData().catch(err => {
  console.error("Failed to seed initial data:", err);
  // App will still work with empty data - users can create their own
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ✅ FIX: Wrap entire app in ErrorBoundary to catch errors gracefully */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
