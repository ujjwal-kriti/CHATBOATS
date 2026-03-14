import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-slate-500 dark:text-gray-400">This section is coming soon.</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard routes - redirects to /login if not authenticated */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Placeholder title="Attendance" />} />
          <Route path="academic" element={<Placeholder title="Academic Performance" />} />
          <Route path="backlogs" element={<Placeholder title="Backlogs" />} />
          <Route path="fees" element={<Placeholder title="Fee Status" />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="chatbot" element={<Placeholder title="Chatbot Assistant" />} />
        </Route>

        {/* Catch-all: redirect unknown paths to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
