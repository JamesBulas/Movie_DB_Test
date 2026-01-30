import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MovieDB from './components/movieDB';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      {/* Navigation */}
      <nav>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<MovieDB />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
