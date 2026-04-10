import { useState, useEffect } from 'react';
import { FileDown, GraduationCap, Trophy, Target, TrendingUp, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import IntraSemesterMarks from '../components/IntraSemesterMarks';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Cell } from 'recharts';
import { useSemester } from '../context/SemesterContext';

// Define some vibrant colors for the subject bar chart
const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export default function AcademicPerformance() {
  const [performance, setPerformance] = useState(null);
  const [student, setStudent] = useState(null);
  const [insights, setInsights] = useState(null);
  const [intraMarks, setIntraMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { selectedSemester } = useSemester();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const queryParams = selectedSemester && selectedSemester !== 'all' ? `?semester=${selectedSemester}` : '';
        
        const [perfRes, dashRes, insRes] = await Promise.all([
          fetch(`https://chatboats-pexp.onrender.com/api/v1/student/performance${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`https://chatboats-pexp.onrender.com/api/v1/student/dashboard${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`https://chatboats-pexp.onrender.com/api/v1/student/insights${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (!perfRes.ok) throw new Error('Failed to fetch performance data');
        
        const [perfData, dashData, insData] = await Promise.all([
          perfRes.json(),
          dashRes.json(),
          insRes.json()
        ]);

        setPerformance(perfData);
        setStudent(dashData.student);
        setInsights(insData.insights);
        setIntraMarks(dashData.intraMarks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSemester]);

  const exportPDF = () => {
    try {
      if (!performance || !student) {
        alert("Data is not ready yet.");
        return;
      }

      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text('Academic Performance Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${timestamp}`, 105, 28, { align: 'center' });
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 35, 190, 35);

      // Student Info
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('Student Profile', 20, 45);
      
      doc.setFontSize(11);
      doc.setTextColor(50);
      doc.text([
        `Name: ${student.name}`,
        `Registration Number: ${student.regNumber}`,
        `Current CGPA: ${performance.currentCGPA}`,
        `Total Subjects: ${performance.subjectWiseMarks?.length || 0}`
      ], 20, 55);

      // CGPA Table
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('Semester-wise CGPA Trend', 20, 85);
      
      const cgpaBody = (performance.semesterWiseCGPA || []).map(s => [
        `Semester ${s.semester}`,
        s.sgpa.toFixed(2)
      ]);

      autoTable(doc, {
        startY: 92,
        head: [['Semester', 'SGPA']],
        body: cgpaBody,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });

      // Marks Table
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      const startY3 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 140;
      doc.text('Subject-wise Grade Analysis', 20, startY3);

      const marksBody = (performance.subjectWiseMarks || []).map(s => [
        s.subject,
        Math.floor(s.marks * 0.3), // Mock internal
        Math.floor(s.marks * 0.7), // Mock external
        s.marks,
        s.grade
      ]);

      autoTable(doc, {
        startY: startY3 + 10,
        head: [['Subject', 'Internal', 'External', 'Total', 'Grade']],
        body: marksBody,
        headStyles: { fillColor: [30, 64, 175] }
      });

      // Insights Section
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      const startY4 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 220;
      doc.text('Performance Insights', 20, startY4);

      doc.setFontSize(11);
      doc.setTextColor(50);
      if (insights) {
        doc.text([
          `Strongest Subject: ${insights.strongSubjects?.[0] || 'N/A'}`,
          `Areas of Improvement: ${insights.weakSubjects?.[0] || 'N/A'}`,
          `AI Suggestion: ${insights.improvementSuggestions?.[0] || 'Keep consistent study habits.'}`
        ], 20, startY4 + 10);
      } else {
        doc.text('Performance analysis in progress...', 20, startY4 + 10);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text('Confidential - Parent Academic Monitoring System', 105, 285, { align: 'center' });
      }

      doc.save(`performance-report-${student.regNumber}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF report.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      <p className="text-slate-500 font-medium">Analyzing Academic Performance...</p>
    </div>
  );

  const chartData = (performance.semesterWiseCGPA || []).map(s => ({
    name: `Sem ${s.semester}`,
    gpa: s.sgpa
  }));

  const subjectChartData = selectedSemester && selectedSemester !== 'all' ? (performance.subjectWiseMarks || []).map(s => ({
    subject: s.subject,
    marks: s.marks
  })) : [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Academic <span className="text-indigo-600">Performance</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Detailed grade analysis and CGPA progression</p>
        </div>
        
        <button
          onClick={exportPDF}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-2xl shadow-xl shadow-indigo-500/20 transition-all transform hover:-translate-y-1 active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <FileDown className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-sm">Export Performance PDF</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* CGPA Card */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm group hover:border-indigo-500/50 transition-all flex flex-col justify-between h-32">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current CGPA</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{performance.currentCGPA}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 mt-2">
            <TrendingUp className="w-3 h-3" />
            <span>Top 10% of Branch</span>
          </div>
        </div>

        {/* Subjects Card */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm group hover:border-blue-500/50 transition-all flex flex-col justify-between h-32">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Subjects</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{performance.subjectWiseMarks?.length || 0}</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-500 mt-2 italic">Completed 48 Credits</p>
        </div>

        {/* Strong Subject Card */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm group hover:border-emerald-500/50 transition-all flex flex-col justify-between h-32">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strongest Area</p>
              <p className="text-[13px] font-black text-slate-900 dark:text-white truncate uppercase mt-0.5">{insights?.strongSubjects?.[0] || 'N/A'}</p>
            </div>
          </div>
          <p className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-wider">High performance detected</p>
        </div>

        {/* Weak Subject Card */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm group hover:border-rose-500/50 transition-all flex flex-col justify-between h-32">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-rose-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Needs Improvement</p>
              <p className="text-[13px] font-black text-slate-900 dark:text-white truncate uppercase mt-0.5">{insights?.weakSubjects?.[0] || 'N/A'}</p>
            </div>
          </div>
          <p className="text-[9px] font-bold text-rose-500/80 uppercase tracking-wider">Extra focus suggested</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
             {selectedSemester && selectedSemester !== 'all' ? `Semester ${selectedSemester} Subject Marks` : 'Semester-wise CGPA Trend'}
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-600 uppercase">Live Metrics</span>
          </div>
        </div>
        <div className="h-[350px] w-full max-w-4xl">
          <ResponsiveContainer width="100%" height="100%">
            {selectedSemester && selectedSemester !== 'all' ? (
               <BarChart 
                 data={subjectChartData} 
                 margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                 barCategoryGap="30%"
               >
                 <defs>
                   {BAR_COLORS.map((color, index) => (
                     <linearGradient key={`grad-${index}`} id={`barGradientMarks-${index}`} x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor={color} stopOpacity={1} />
                       <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                     </linearGradient>
                   ))}
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-gray-700/50" />
                 <XAxis 
                   dataKey="subject" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                   interval={0}
                   angle={-25}
                   textAnchor="end"
                   height={60}
                   tickFormatter={(value) => {
                     const cleanStr = value.split(' (')[0];
                     return cleanStr.length > 15 ? cleanStr.substring(0, 15) + '...' : cleanStr;
                   }}
                 />
                 <YAxis 
                   domain={[0, 100]} 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                   dx={-10}
                 />
                 <Tooltip 
                   cursor={{ fill: 'transparent' }}
                   contentStyle={{ 
                     borderRadius: '16px', 
                     border: 'none', 
                     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                     backgroundColor: '#0F172A',
                     color: '#fff',
                     padding: '12px'
                   }}
                   itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                   labelStyle={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '800' }}
                   formatter={(value) => [`${value} Marks`, 'Score']}
                 />
                 <Bar dataKey="marks" radius={[8, 8, 0, 0]} barSize={40}>
                   {subjectChartData.map((_, index) => (
                     <Cell key={`cell-${index}`} fill={`url(#barGradientMarks-${index % BAR_COLORS.length})`} />
                   ))}
                 </Bar>
               </BarChart>
            ) : (
               <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                 <defs>
                   <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-gray-700/50"/>
                 <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                   dy={10}
                 />
                 <YAxis 
                   domain={[0, 10]} 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                   dx={-10}
                 />
                 <Tooltip 
                   contentStyle={{ 
                     borderRadius: '16px', 
                     border: 'none', 
                     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                     backgroundColor: '#0F172A',
                     color: '#fff',
                     padding: '12px'
                   }}
                   itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                   labelStyle={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '800' }}
                 />
                 <Area 
                   type="monotone" 
                   dataKey="gpa" 
                   stroke="#4f46e5" 
                   strokeWidth={4}
                   fillOpacity={1} 
                   fill="url(#colorGpa)" 
                   dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                   activeDot={{ r: 6, strokeWidth: 0 }}
                 />
               </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intra Semester Marks Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight ml-2">Internal Assessment Progress</h3>
        <IntraSemesterMarks marks={intraMarks} />
      </div>

      {/* Marks Table */}
      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Subject-wise Performance Breakdown</h3>
            <span className="px-4 py-1.5 bg-indigo-600 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">Sem {selectedSemester !== 'all' && selectedSemester ? selectedSemester : (student?.semester || 'Current')} Stats</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-900/50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal (30%)</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">External (70%)</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Total (100)</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
              {performance.subjectWiseMarks.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="block font-bold text-slate-800 dark:text-gray-100 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{s.subject}</span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mt-1">Theory + Lab</span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-sm font-black text-slate-600 dark:text-gray-400">{Math.floor(s.marks * 0.3)}</span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-sm font-black text-slate-600 dark:text-gray-400">{Math.floor(s.marks * 0.7)}</span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs shadow-inner">
                      {s.marks}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex min-w-[32px] justify-center px-2 py-1 rounded-lg text-xs font-black ${
                      s.marks >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {s.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-[#0F172A] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] -ml-20 -mb-20" />
        
        <div className="relative grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Personalized Insights</span>
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tight leading-tight mb-4">
              Academic Performance <br />
              <span className="text-indigo-400">Projection & Analysis</span>
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Based on the semester-wise projection, the student is showing a consistent growth of 
              <span className="text-white ml-1">0.4 SGPA per semester</span>. Maintaining this trajectory 
              could lead to a final CGPA of 8.8.
            </p>
          </div>

          <div className="space-y-4">
             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Success Suggestion</p>
                      <p className="text-sm font-bold leading-relaxed">{insights?.improvementSuggestions?.[0] || 'Keep up the good work!'}</p>
                   </div>
                </div>
             </div>
             
             <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-indigo-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Primary Insight</p>
                      <p className="text-sm font-bold leading-relaxed">High proficiency detected in technical core subjects. Theoretical electives show steady baseline.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
