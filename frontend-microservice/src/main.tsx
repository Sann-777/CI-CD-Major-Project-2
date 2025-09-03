import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store'
import './index.css'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      // cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#161D29',
                color: '#FFFFFF',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #2C333F',
              },
              success: {
                iconTheme: {
                  primary: '#06D6A0',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF476F',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
)
