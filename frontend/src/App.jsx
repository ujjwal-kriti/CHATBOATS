import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import AcademicPerformance from './pages/AcademicPerformance'
import Backlogs from './pages/Backlogs'
import Fees from './pages/Fees'
import Notifications from './pages/Notifications'
import ChatbotAssistant from './pages/ChatbotAssistant'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './admin/AdminLayout'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import AdminStudents from './admin/AdminStudents'
import AdminNotifications from './admin/AdminNotifications'
import AdminMarks from './admin/AdminMarks'
import AdminProtectedRoute from './components/AdminProtectedRoute'

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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
          <Route path="attendance" element={<Attendance />} />
          <Route path="academic" element={<AcademicPerformance />} />
          <Route path="backlogs" element={<Backlogs />} />
          <Route path="fees" element={<Fees />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="chatbot" element={<ChatbotAssistant />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="students/add" element={<AdminStudents />} />
          <Route path="marks" element={<AdminMarks />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        {/* Catch-all: redirect unknown paths to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
