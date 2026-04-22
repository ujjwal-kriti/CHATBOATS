import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Activity,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const chartData = [
  { name: 'Mon', attendance: 82, performance: 65 },
  { name: 'Tue', attendance: 85, performance: 68 },
  { name: 'Wed', attendance: 89, performance: 72 },
  { name: 'Thu', attendance: 84, performance: 70 },
  { name: 'Fri', attendance: 87, performance: 75 },
  { name: 'Sat', attendance: 92, performance: 80 },
  { name: 'Sun', attendance: 90, performance: 78 },
];

const StatCard = ({ title, value, subValue, icon: Icon, color, glow }) => (
  <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl p-7 rounded-[2rem] border border-white/10 shadow-2xl transition-all hover:border-white/20 hover:-translate-y-1 group">
    <div className={`absolute -top-10 -right-10 w-32 h-32 ${glow} rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
    <div className="flex justify-between items-start">
      <div className="relative z-10">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-black text-white tracking-tight">{value}</h3>
        <p className="text-slate-500 text-xs mt-3 flex items-center gap-1.5 font-medium">
          <Zap size={12} className="text-amber-400" />
          {subValue}
        </p>
      </div>
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 border border-white/5 shadow-inner transition-transform group-hover:scale-110`}>
        <Icon className={color.replace('bg-', 'text-')} size={28} />
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
    <div className="space-y-10 max-w-7xl mx-auto p-2">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
              <ShieldCheck className="text-indigo-400" size={20} />
            </div>
            <span className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">Live Command Center</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">Institutional Overview</h1>
          <p className="text-slate-400 text-lg font-medium flex items-center gap-3">
            <Calendar className="text-slate-500" size={18} />
            Academic Cycle <span className="text-indigo-400">2025—2026</span>
          </p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-8">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-emerald-400 text-sm font-black tracking-wider">SYSTEM ACTIVE</span>
                </div>
            </div>
            <div className="w-[1px] h-10 bg-white/10"></div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Database</span>
                <span className="text-indigo-400 text-sm font-black">STABLE</span>
            </div>
        </div>
      </div>

      {/* High-End Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
        <StatCard 
          title="Total Enrollment" 
          value={stats.totalStudents} 
          subValue="Active student directory"
          icon={Users}
          color="bg-indigo-500"
          glow="bg-indigo-500"
        />
        <StatCard 
          title="Attendance Efficiency" 
          value={`${stats.avgAttendance}%`} 
          subValue="Institutional average today"
          icon={TrendingUp}
          color="bg-emerald-500"
          glow="bg-emerald-500"
        />
        <StatCard 
          title="Pending Receivables" 
          value={`₹${(stats.pendingFees / 1000).toFixed(1)}k`} 
          subValue="Uncollected academic fees"
          icon={CreditCard}
          color="bg-amber-500"
          glow="bg-amber-500"
        />
        <StatCard 
          title="Academic Alerts" 
          value={stats.atRiskStudents} 
          subValue="Attendance below threshold"
          icon={AlertTriangle}
          color="bg-rose-500"
          glow="bg-rose-500"
        />
      </div>

      {/* Main Analytics Area */}
      <div className="bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
            <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Activity className="text-indigo-500" size={24} />
                    Engagement Metrics
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Institutional performance trends for current week</p>
            </div>
            <div className="flex gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scores</span>
                </div>
            </div>
        </div>
        
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}}
                        dy={15}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}}
                        domain={[0, 100]}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '15px' }}
                    />
                    <Area type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorAtt)" />
                    <Area type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorPerf)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-white flex items-center gap-3">
                    <Clock className="text-indigo-400" size={22} />
                    LATEST MILESTONES
                </h2>
                <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">See Complete History</button>
            </div>
            <div className="space-y-5">
                {[
                    { log: "1st Year - Sem 1 attendance records synchronized for Mid-Term", time: "2 MINS AGO", icon: GraduationCap },
                    { log: "New Batch registration: Verification complete", time: "45 MINS AGO", icon: Users },
                    { log: "Internal marks report generated for CSE Department", time: "2 HOURS AGO", icon: FileText },
                    { log: "Weekly academic performance audit complete", time: "5 HOURS AGO", icon: ShieldCheck },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 bg-white/5 p-5 rounded-[1.5rem] border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer group">
                        <div className="p-3 bg-indigo-500/10 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                            {item.icon ? <item.icon className="text-indigo-400" size={18} /> : <Activity className="text-indigo-400" size={18} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-300 font-bold leading-tight">{item.log}</p>
                            <p className="text-[10px] text-indigo-400 font-black mt-1.5 tracking-wider">{item.time}</p>
                        </div>
                        <ArrowUpRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black tracking-tight">CAMPUS HUB</h3>
                    <Calendar size={24} className="text-white/40" />
                </div>
                <div className="space-y-5">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                        <p className="text-lg font-bold">Lab Externals</p>
                        <p className="text-xs text-white/60 font-medium mt-1">Starting June 12, 2026</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                        <p className="text-lg font-bold">Faculty Meet</p>
                        <p className="text-xs text-white/60 font-medium mt-1">R24 Curriculum Strategy</p>
                    </div>
                </div>
            </div>
            <button className="relative z-10 mt-10 bg-white text-indigo-600 font-black py-5 rounded-[1.5rem] hover:scale-[1.03] active:scale-[0.97] shadow-2xl transition-all text-sm uppercase tracking-widest">
                Create Announcement
            </button>
        </div>
      </div>
    </div>
  );
};

const FileText = ({ className, size }) => <BookOpen className={className} size={size} />;

export default AdminDashboard;
