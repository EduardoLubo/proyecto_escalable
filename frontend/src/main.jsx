import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './css/globals.css'
import App from './App.jsx'
import Spinner from './views/spinner/Spinner.jsx'


createRoot(document.getElementById('root')).render(
    <Suspense fallback={<Spinner />}>
        <App />
    </Suspense>,
)
