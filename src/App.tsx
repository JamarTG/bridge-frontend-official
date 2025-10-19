
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Index from './pages/Meeting'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import Dashboard from './pages/Dashboard'
import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/room/:uuid" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={3000}
      />
    </BrowserRouter>
  )
}

export default App