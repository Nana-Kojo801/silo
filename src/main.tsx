import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#191935',
            color: '#ededf8',
            border: '1px solid #2a2a50',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: '#7c4dff', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#f94d6a', secondary: '#fff' },
          },
        }}
      />
    </ConvexAuthProvider>
  </StrictMode>,
)
