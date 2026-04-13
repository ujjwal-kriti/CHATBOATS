import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-gray-100">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-2">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgAttendance: 0,
    pendingFees: 0,
    atRiskStudents: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('/api/v1/admin/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const students = response.data;
        setStats({
          totalStudents: students.length,
          avgAttendance: (students.reduce((acc, s) => acc + (s.attendance || 0), 0) / students.length).toFixed(1),
          pendingFees: students.reduce((acc, s) => acc + (s.fees || 0), 0),
          atRiskStudents: students.filter(s => (s.attendance || 0) < 75).length
        });
      } catch (err) {
        console.error('Error fetching dashboard stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Institutional Overview</h1>
          <p className="text-slate-500 text-sm">Real-time status of academic operations</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700 dark:text-gray-300">Operational Status</p>
          <div className="flex items-center gap-2 justify-end text-emerald-500 text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          subValue="Enrolled across all branches"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard 
          title="Avg Attendance" 
          value={`${stats.avgAttendance}%`} 
          subValue="Institutional average"
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Pending Dues" 
          value={`₹${stats.pendingFees.toLocaleString()}`} 
          subValue="Outstanding student fees"
          icon={CreditCard}
          color="bg-amber-500"
        />
        <StatCard 
          title="At-Risk Alerts" 
          value={stats.atRiskStudents} 
          subValue="Attendance below 75%"
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-gray-100 flex items-center gap-2">
                <Clock className="text-indigo-500" size={20} />
                Recent System Activity
            </h2>
            <div className="space-y-6">
                {[
                    { log: "Admin authenticated from IP: 192.168.1.1", time: "2 mins ago" },
                    { log: "New student record created: 231fa04g30", time: "45 mins ago" },
                    { log: "Batch email sent: Final Exam Schedules", time: "2 hours ago" },
                    { log: "Database backup completed successfully", time: "5 hours ago" },
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-1">
                        <div className="flex-1">
                            <p className="text-sm text-slate-700 dark:text-gray-300">{item.log}</p>
                            <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Notice Board</h3>
                <p className="text-indigo-100 text-sm mb-6">Upcoming administrative tasks</p>
                <div className="space-y-4">
                   <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                        <p className="text-sm font-bold">Semester End Exams</p>
                        <p className="text-xs text-white/70">Starting From: April 20, 2026</p>
                   </div>
                   <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                        <p className="text-sm font-bold">Board Meeting</p>
                        <p className="text-xs text-white/70">Scheduled for Friday at 10 AM</p>
                   </div>
                </div>
                <button className="mt-8 w-full bg-white text-indigo-600 font-bold py-3 rounded-lg hover:bg-slate-50 transition-all">
                    Post New Notice
                </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
