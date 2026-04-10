import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, BookOpen, Clock, Activity, Target, ShieldCheck, XCircle } from 'lucide-react';
import { useSemester } from '../context/SemesterContext';

export default function Backlogs() {
  const [status, setStatus] = useState(null);
  const [studentSem, setStudentSem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { selectedSemester } = useSemester();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const queryParams = selectedSemester && selectedSemester !== 'all' ? `?semester=${selectedSemester}` : '';
        
        // Fetch Academic Status
        const statusRes = await fetch(`https://chatboats-pexp.onrender.com/api/v1/student/dashboard${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!statusRes.ok) throw new Error('Failed to fetch academic status');
        const dashData = await statusRes.json();
        
        setStatus(dashData.academicStatus);
        setStudentSem(dashData.student?.semester || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSemester]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Loading Academic Status...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center gap-3">
      <AlertTriangle className="w-5 h-5" />
      <span className="font-semibold">Error: {error}</span>
    </div>
  );

  const hasBacklogs = status?.numberOfBacklogs > 0;
  // Mock data for the overall percentage since the current backend schema might not have the exact numbers
  const totalSubjects = 40;
  const completedSubjects = totalSubjects - (status?.numberOfBacklogs || 0) - (status?.incompleteSubjects?.length || 0) * 0.5; // Roughly estimate completed
  const completionPercentage = Math.round((completedSubjects / totalSubjects) * 100);

  const displaySem = selectedSemester && selectedSemester !== 'all' ? selectedSemester : studentSem;

  // Mock backlog details reacting dynamically to the selected semester
  const backlogDetails = hasBacklogs ? Array.from({ length: status?.numberOfBacklogs || 0 }).map((_, i) => ({
    subject: `Subject ${['Alpha', 'Beta', 'Gamma', 'Delta'][i % 4]} (Pending)`, 
    semester: `Semester ${displaySem}`, 
    status: 'Not Cleared', 
    examDate: `May ${2026 + parseInt(displaySem)}` 
  })) : [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            Academic <span className={hasBacklogs ? "text-rose-600" : "text-emerald-500"}>Status</span>
            {!hasBacklogs && <ShieldCheck className="w-8 h-8 text-emerald-500" />}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Tracking backlogs and course completion</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Backlogs */}
        <div className={`border rounded-3xl p-6 shadow-sm transition-all ${
          hasBacklogs 
            ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800' 
            : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              hasBacklogs 
                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' 
                : 'bg-slate-50 dark:bg-gray-700 text-slate-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Backlogs</p>
              <p className={`text-3xl font-black ${
                hasBacklogs ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white'
              }`}>
                {status?.numberOfBacklogs || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Repeated Subjects */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repeated</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {status?.repeatedSubjects?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Incomplete Subjects */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incomplete</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {status?.incompleteSubjects?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Course Completion Mini Progress */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
           <div className="flex justify-between items-end mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Progress</p>
              <span className="text-xl font-black text-emerald-500">{completionPercentage}%</span>
           </div>
           <div className="h-2 w-full bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
           </div>
        </div>
      </div>

      {/* Course Completion Status Bar Section */}
      <div className="bg-[#0F172A] rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] -mr-20 -mt-20" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 w-full space-y-4">
               <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Target className="w-6 h-6 text-emerald-400" />
                  Course Completion Journey
               </h3>
               
               <div className="flex justify-between text-sm font-bold text-slate-400">
                  <span className="text-emerald-400">0%</span>
                  <span>{completionPercentage}% Completed</span>
                  <span>100%</span>
               </div>
               
               <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                 <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000 relative" style={{ width: `${completionPercentage}%` }}>
                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-[2px]" />
                 </div>
               </div>
               
               <div className="flex flex-wrap gap-6 pt-4">
                  <div>
                     <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Subjects</p>
                     <p className="text-lg font-bold text-white">{totalSubjects}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Completed</p>
                     <p className="text-lg font-bold text-emerald-400">{completedSubjects}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Remaining</p>
                     <p className="text-lg font-bold text-slate-300">{totalSubjects - completedSubjects}</p>
                  </div>
               </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex shrink-0 items-center justify-center p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
               <div className="text-center">
                  <Activity className={`w-10 h-10 mx-auto mb-2 ${hasBacklogs ? 'text-rose-400' : 'text-emerald-400'}`} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className={`text-lg font-black uppercase ${hasBacklogs ? 'text-rose-400' : 'text-emerald-400'}`}>
                     {hasBacklogs ? 'Action Needed' : 'On Track'}
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Backlog Subjects Table */}
           <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/20">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Backlog Subjects</h3>
                    {hasBacklogs && (
                       <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {status?.numberOfBacklogs} Pending
                       </span>
                    )}
                 </div>
              </div>
              
              {!hasBacklogs ? (
                 <div className="p-12 text-center flex flex-col items-center justify-center bg-slate-50/30 dark:bg-gray-900/10">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
                       <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase">No Backlog Subjects</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Student is academically clear and in good standing.</p>
                 </div>
              ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="bg-slate-50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-gray-800">
                             <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Name</th>
                             <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</th>
                             <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                             <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Reattempt Date</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                          {backlogDetails.map((b, idx) => (
                             <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-5 font-bold text-slate-800 dark:text-gray-100">{b.subject}</td>
                                <td className="px-6 py-5 text-center text-sm font-semibold text-slate-500">{b.semester}</td>
                                <td className="px-6 py-5 text-center">
                                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-black">
                                      <XCircle className="w-3.5 h-3.5" />
                                      {b.status}
                                   </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                   <span className="inline-flex px-3 py-1 rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 text-xs font-bold font-mono">
                                      {b.examDate}
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              )}
           </div>
           
           {/* Repeated Subjects Timeline */}
           <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Repeated Subjects History</h3>
              
              {(status?.repeatedSubjects?.length || 0) === 0 ? (
                 <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-3xl">
                    <p className="text-slate-400 font-medium text-sm">No subjects have been repeated.</p>
                 </div>
              ) : (
                 <div className="space-y-6">
                    {status.repeatedSubjects.map((subject, idx) => (
                       <div key={idx} className="flex gap-6 items-start relative before:absolute before:left-[19px] before:top-10 before:bottom-[-24px] before:w-0.5 before:bg-slate-100 dark:before:bg-gray-700 last:before:hidden">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center z-10 border-4 border-white dark:border-gray-800">
                             <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1 bg-slate-50 dark:bg-gray-900/30 border border-slate-100 dark:border-gray-700 rounded-2xl p-5">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                <h4 className="font-bold text-slate-800 dark:text-gray-100 text-lg">{subject}</h4>
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-black uppercase shadow-sm">
                                   Attempt Count: 2
                                </span>
                             </div>
                             <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                <AlertTriangle className="w-4 h-4 text-slate-400" />
                                <span>Next Exam Scheduled: <strong className="text-slate-700 dark:text-gray-300">May 2026</strong></span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>

        </div>

        {/* Sidebar Alerts Area (Right column) */}
        <div className="lg:col-span-1">
           <div className={`rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-xl sticky top-24 ${
              hasBacklogs ? 'bg-gradient-to-br from-rose-600 to-red-800' : 'bg-[#0F172A] border border-slate-800'
           }`}>
              {hasBacklogs && (
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-10 -mt-20" />
              )}
              
              <div className="relative z-10 flex flex-col h-full">
                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mb-6 shadow-inner">
                    {hasBacklogs ? <AlertTriangle className="w-6 h-6 text-white" /> : <ShieldCheck className="w-6 h-6 text-emerald-400" />}
                 </div>
                 
                 <h3 className="text-xl font-black uppercase tracking-tight mb-4 leading-tight text-white/90">
                    Academic <br/> <span className="text-white">Alert System</span>
                 </h3>

                 <div className={`p-6 rounded-3xl mt-4 ${
                    hasBacklogs ? 'bg-rose-900/40 border border-rose-400/30' : 'bg-slate-800/50 border border-slate-700/50'
                 }`}>
                    {hasBacklogs ? (
                       <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">Warning Active</p>
                          <p className="text-sm font-bold leading-relaxed text-white">
                             Student currently has <span className="text-rose-200 underline decoration-2 underline-offset-4">{status?.numberOfBacklogs} backlog {status?.numberOfBacklogs === 1 ? 'subject' : 'subjects'}</span> that must be cleared to maintain academic standing.
                          </p>
                       </div>
                    ) : (
                       <div className="space-y-3 text-center py-4">
                          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Status Check</p>
                          <p className="text-lg font-bold text-white uppercase tracking-wider">
                             Good Standing
                          </p>
                       </div>
                    )}
                 </div>
                 
                 {hasBacklogs && (
                    <button className="mt-8 w-full py-4 bg-white text-rose-700 rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                       View Remedial Classes
                    </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
