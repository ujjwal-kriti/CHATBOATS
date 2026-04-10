import { useState, useEffect } from 'react';
import { FileDown, Calendar, CheckCircle2, XCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSemester } from '../context/SemesterContext';

export default function Attendance() {
  const [data, setData] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { selectedSemester } = useSemester();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const queryParams = selectedSemester && selectedSemester !== 'all' ? `?semester=${selectedSemester}` : '';
        
        const [attRes, dashRes] = await Promise.all([
          fetch(`https://chatboats-pexp.onrender.com/api/v1/student/attendance${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`https://chatboats-pexp.onrender.com/api/v1/student/dashboard${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (!attRes.ok) throw new Error('Failed to fetch attendance data');
        
        const [attData, dashData] = await Promise.all([
          attRes.json(),
          dashRes.json()
        ]);

        setData(attData);
        setStudent(dashData.student);
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
      if (!data || !student) {
        alert("Data is still loading or unavailable. Please try again in a moment.");
        return;
      }

      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Set Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); 
      doc.text('Student Attendance Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${timestamp}`, 105, 28, { align: 'center' });
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 35, 190, 35);

      // 1. Student Information
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('Student Information', 20, 45);
      
      doc.setFontSize(11);
      doc.setTextColor(50);
      doc.text([
        `Name: ${student.name || 'N/A'}`,
        `Registration Number: ${student.regNumber || 'N/A'}`,
        `Department: ${student.branch || 'N/A'}`,
        `Semester: ${student.semester || 'N/A'}`
      ], 20, 55);

      // 2. Overall Attendance
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('Overall Attendance Summary', 20, 85);
      
      const subWise = data.subjectWise || [];
      const totalClasses = subWise.reduce((acc, s) => acc + (s.totalClasses || 40), 0);
      const attendedClasses = subWise.reduce((acc, s) => acc + (s.attendedClasses || Math.floor((s.attendance / 100) * 40)), 0);
      const missedClasses = totalClasses - attendedClasses;

      autoTable(doc, {
        startY: 92,
        head: [['Metric', 'Value']],
        body: [
          ['Overall Attendance Percentage', `${data.overallPercentage || 0}%`],
          ['Total Classes Scheduled', totalClasses],
          ['Total Classes Attended', attendedClasses],
          ['Total Classes Missed', missedClasses],
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });

      // 3. Subject-wise Attendance Table
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      const startY3 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 130;
      doc.text('Subject-wise Attendance', 20, startY3);

      const subjectBody = subWise.map(s => [
        s.subject,
        s.totalClasses || 40,
        s.attendedClasses || Math.floor((s.attendance / 100) * 40),
        `${s.attendance}%`
      ]);

      autoTable(doc, {
        startY: startY3 + 10,
        head: [['Subject Name', 'Total Classes', 'Attended', 'Percentage']],
        body: subjectBody,
        headStyles: { fillColor: [30, 64, 175] }
      });

      // 4. Semester-wise Summary
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      const startY4 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 200;
      doc.text('Semester-wise History', 20, startY4);

      const semBody = (data.semesterWise || []).map(s => [
        `Semester ${s.semester}`,
        `${s.attendance}%`
      ]);

      autoTable(doc, {
        startY: startY4 + 10,
        head: [['Semester', 'Attendance']],
        body: semBody,
        margin: { right: 80 }
      });

      // 5. Alerts Section
      const alerts = subWise.filter(s => s.attendance < 75);
      doc.setFontSize(14);
      if (alerts.length > 0) {
        doc.setTextColor(220, 38, 38); // red-600
      } else {
        doc.setTextColor(22, 163, 74); // green-600
      }
      const startY5 = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 250;
      doc.text('Low Attendance Alerts', 20, startY5);

      if (alerts.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(220, 38, 38);
        alerts.forEach((a, i) => {
          doc.text(`- Warning: ${a.subject} is at ${a.attendance}% (Below 75% threshold)`, 25, startY5 + 10 + (i * 7));
        });
      } else {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text('No low attendance alerts.', 25, startY5 + 10);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text('Confidential Academic Record - Parent Academic Monitoring System', 20, 285);
          doc.text(`Page ${i} of ${pageCount}`, 180, 285);
      }

      doc.save(`attendance-report-${student.regNumber || 'download'}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Error generating PDF. Check console for details.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="text-slate-500 font-medium">Preparing Attendance Records...</p>
    </div>
  );
  
  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 italic">Error: {error}</div>;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Attendance <span className="text-blue-600">Insights</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Comprehensive academic presence report</p>
        </div>
        
        <button
          onClick={exportPDF}
          className="flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <FileDown className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight">Export Attendance Report (PDF)</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Average</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{data.overallPercentage}%</p>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${data.overallPercentage}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-2xl font-black text-emerald-600">{data.overallPercentage >= 75 ? 'Safe' : 'Warning'}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Threshold: 75% | Required Classes: 48</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerts</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {data.subjectWise.filter(s => s.attendance < 75).length} Matters
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium font-bold">Subjects below 75%</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Subject-wise Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-900/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Classes</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Attended</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
              {data.subjectWise.map((subject, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600 text-xs text-xs">
                        {subject.subject.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-gray-100">{subject.subject}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-slate-500">40</td>
                  <td className="px-6 py-5 text-center font-bold text-slate-800 dark:text-gray-200">{Math.floor((subject.attendance / 100) * 40)}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black tracking-tight ${
                      subject.attendance >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {subject.attendance}%
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {subject.attendance >= 75 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Semester-wise History */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Semester History</h3>
          <div className="space-y-4">
            {(data.semesterWise || []).map((sem, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-900/30 rounded-2xl border border-slate-100 dark:border-gray-700 transition-hover hover:border-blue-200 dark:hover:border-blue-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center font-black text-slate-400">
                    {sem.semester}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-gray-300">Semester {sem.semester}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-black text-blue-600">{sem.attendance}%</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Warnings */}
        <div className="bg-[#0F172A] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px]" />
          <h3 className="relative text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            Critical Attendance Alerts
          </h3>
          
          <div className="relative space-y-4">
            {data.subjectWise.filter(s => s.attendance < 75).length > 0 ? (
              data.subjectWise.filter(s => s.attendance < 75).map((s, idx) => (
                <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">Below required 75%</p>
                    <p className="text-base font-bold text-white">{s.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-rose-500">{s.attendance}%</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Warning</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                 <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                 <p className="font-bold uppercase tracking-widest text-xs">No low attendance alerts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
