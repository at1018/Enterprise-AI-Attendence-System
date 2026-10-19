import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import Students from './pages/Students'
import Teachers from './pages/Teachers'
import Classes from './pages/Classes'
import Subjects from './pages/Subjects'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { useAuth } from './context/AuthContext'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/sessions" 
        element={isAuthenticated ? <Sessions /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/students" 
        element={isAuthenticated ? <Students /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/teachers" 
        element={isAuthenticated ? <Teachers /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/classes" 
        element={isAuthenticated ? <Classes /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/subjects" 
        element={isAuthenticated ? <Subjects /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/reports" 
        element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/settings" 
        element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
