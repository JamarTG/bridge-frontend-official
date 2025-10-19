import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Index from './pages/Meeting'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import Dashboard from './pages/Dashboard'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/protected-route'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:uuid"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
