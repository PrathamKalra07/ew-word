import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Documents from './pages/Documents'
import Document from './pages/Document'
import NotFound from './pages/NotFound'

function App() {

  return (
    <>
     <BrowserRouter>
        <Routes>
            <Route index element={<Homepage />} />
            <Route path='*' element={<NotFound />} />
            <Route path='/documents' element={<Documents />} />
            <Route path='/document/:fileId' element={<Document />} />
        </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
