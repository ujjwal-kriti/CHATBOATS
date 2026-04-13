import { useState, useEffect } from 'react'
import StudentProfileCard from '../components/StudentProfileCard'
import DashboardCards from '../components/DashboardCards'
import AttendanceChart from '../components/Charts/AttendanceChart'
import SubjectMarksChart from '../components/Charts/SubjectMarksChart'
import AcademicAlerts from '../components/AcademicAlerts'
import PerformanceInsights from '../components/PerformanceInsights'
import QuickContacts from '../components/QuickContacts'
import { useSemester } from '../context/SemesterContext'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { selectedSemester, setSelectedSemester } = useSemester()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const queryParams = selectedSemester && selectedSemester !== 'all' ? `?semester=${selectedSemester}` : ''

        const [res, attRes, perfRes, finRes, insRes] = await Promise.all([
          fetch(`/api/v1/student/dashboard${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/v1/student/attendance${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/v1/student/performance${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/v1/student/financials${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/v1/student/insights${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!res.ok) throw new Error('Failed to fetch dashboard data')

        const dashboardData = await res.json()
        if (!selectedSemester) {
          setSelectedSemester(dashboardData.student.semester)
        }

        const [attendanceData, perfData, finData, insightsData] = await Promise.all([
          attRes.ok ? attRes.json() : null,
          perfRes.ok ? perfRes.json() : null,
          finRes.ok ? finRes.json() : null,
          insRes.ok ? insRes.json() : null
        ]);

        const subjectList = perfData ? perfData.subjectWiseMarks : [];
        let dynStrong = "N/A";
        let dynWeak = "N/A";
        let dynSuggestion = "No insights available.";

        if (subjectList && subjectList.length > 0) {
          const sorted = [...subjectList].sort((a, b) => b.marks - a.marks);
          dynStrong = sorted[0].subject.split(' (Sem')[0] || sorted[0].subject;
          dynWeak = sorted[sorted.length - 1].subject.split(' (Sem')[0] || sorted[sorted.length - 1].subject;

          if (sorted[sorted.length - 1].marks < 60) {
            dynSuggestion = `Allocate more study time for ${dynWeak} to improve your grade.`;
          } else {
            dynSuggestion = `Excellent work in ${dynStrong}! Keep up the consistent effort.`;
          }
        } else if (insightsData && insightsData.insights) {
          dynStrong = insightsData.insights.strongSubjects[0] || "N/A";
          dynWeak = insightsData.insights.weakSubjects[0] || "N/A";
          dynSuggestion = insightsData.insights.improvementSuggestions[0] || "Maintain consistency.";
        }

        // Construct final data format expected by components
        const formattedData = {
          studentDetails: {
            name: dashboardData.student.name,
            registrationNumber: dashboardData.student.regNumber,
            department: dashboardData.student.branch,
            year: selectedSemester === 'all' ? 'Overall' : `Semester ${selectedSemester || dashboardData.student.semester}`,
            section: "N/A",
            parentPhone: dashboardData.student.phone || "N/A",
            maxSemester: dashboardData.student.semester
          },
          academicSummary: {
            attendancePercentage: dashboardData.attendance?.overallPercentage || 0,
            cgpa: dashboardData.performance?.currentCGPA || 0,
            backlogsCount: dashboardData.academicStatus?.numberOfBacklogs || 0,
            pendingFees: finData ? finData.pendingFees.toString() : '0',
          },
          attendanceData: attendanceData ? attendanceData.subjectWise : [],
          subjectMarks: perfData ? perfData.subjectWiseMarks : [],
          alerts: dashboardData.notifications.map((n, idx) => ({
            id: n.id,
            type: idx % 2 === 0 ? "attendance" : "exam", // simple mock logic for alerts
            title: "Notification",
            message: (n.upcomingExams[0] || n.assignmentDeadlines[0] || dashboardData.attendance?.lowAttendanceAlerts[0] || 'Update received'),
            date: new Date().toISOString().split('T')[0]
          })),
          performanceInsights: {
            strongSubject: dynStrong,
            weakSubject: dynWeak,
            suggestion: dynSuggestion
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
  }, [selectedSemester])

  if (loading) return <div className="p-8 text-center text-slate-600 dark:text-gray-300">Loading dashboard...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>
  if (!data) return null

  // Generate options up to current semester
  const semesterOptions = Array.from({ length: data.studentDetails.maxSemester }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Select Semester:</label>
          <select
            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="all">Overall Summary</option>
            {semesterOptions.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
      </div>

      <StudentProfileCard student={data.studentDetails} />
      <DashboardCards data={data.academicSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-100 mb-4">Subject-wise Attendance</h3>
          <AttendanceChart data={data.attendanceData} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/80 dark:border-gray-700 shadow-sm p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-100 mb-4">Subject Marks</h3>
          <SubjectMarksChart data={data.subjectMarks} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AcademicAlerts alerts={data.alerts} />
        <PerformanceInsights insights={data.performanceInsights} />
        <QuickContacts />
      </div>
    </div>
  )
}
