import { useState, useEffect } from 'react'
import StudentProfileCard from '../components/StudentProfileCard'
import DashboardCards from '../components/DashboardCards'
import AttendanceChart from '../components/Charts/AttendanceChart'
import CGPATrendChart from '../components/Charts/CGPATrendChart'
import AcademicAlerts from '../components/AcademicAlerts'
import PerformanceInsights from '../components/PerformanceInsights'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Fetch everything from the dashboard endpoint
        const res = await fetch('/api/v1/student/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!res.ok) throw new Error('Failed to fetch dashboard data')
        
        const dashboardData = await res.json()
        
        // Fetch detailed attendance for chart
        const attRes = await fetch('/api/v1/student/attendance', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const attendanceData = attRes.ok ? await attRes.json() : null

        // Fetch detailed performance for chart
        const perfRes = await fetch('/api/v1/student/performance', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const perfData = perfRes.ok ? await perfRes.json() : null

        // Fetch financials
        const finRes = await fetch('/api/v1/student/financials', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const finData = finRes.ok ? await finRes.json() : null

        // Fetch insights
        const insRes = await fetch('/api/v1/student/insights', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const insightsData = insRes.ok ? await insRes.json() : null

        // Construct final data format expected by components
        const formattedData = {
          studentDetails: {
            name: dashboardData.student.name,
            registrationNumber: dashboardData.student.regNumber,
            department: dashboardData.student.branch,
            year: `Semester ${dashboardData.student.semester}`,
            section: "N/A",
            parentPhone: dashboardData.student.parentPhone,
          },
          academicSummary: {
            attendancePercentage: dashboardData.attendance?.overallPercentage || 0,
            cgpa: dashboardData.performance?.currentCGPA || 0,
            backlogsCount: dashboardData.academicStatus?.numberOfBacklogs || 0,
            pendingFees: finData ? finData.pendingFees.toString() : '0',
          },
          attendanceData: attendanceData ? attendanceData.subjectWise : [],
          cgpaTrend: perfData ? perfData.semesterWiseCGPA.map(s => ({ semester: `Sem ${s.semester}`, cgpa: s.sgpa })) : [],
          alerts: dashboardData.notifications.map((n, idx) => ({
            id: n.id,
            type: idx % 2 === 0 ? "attendance" : "exam", // simple mock logic for alerts
            title: "Notification",
            message: (n.upcomingExams[0] || n.assignmentDeadlines[0] || dashboardData.attendance?.lowAttendanceAlerts[0] || 'Update received'),
            date: new Date().toISOString().split('T')[0]
          })),
          performanceInsights: insightsData && insightsData.insights ? {
            strongSubject: insightsData.insights.strongSubjects[0] || "N/A",
            weakSubject: insightsData.insights.weakSubjects[0] || "N/A",
            suggestion: insightsData.insights.improvementSuggestions[0] || "Maintain consistency."
          } : {
            strongSubject: "N/A", weakSubject: "N/A", suggestion: "No insights available."
          }
        }

        setData(formattedData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center text-slate-600 dark:text-gray-300">Loading dashboard...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <StudentProfileCard student={data.studentDetails} />
      <DashboardCards data={data.academicSummary} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-100 mb-4">Subject-wise Attendance</h3>
          <AttendanceChart data={data.attendanceData} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-100 mb-4">CGPA Trend</h3>
          <CGPATrendChart data={data.cgpaTrend} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AcademicAlerts alerts={data.alerts} />
        <PerformanceInsights insights={data.performanceInsights} />
      </div>
    </div>
  )
}
