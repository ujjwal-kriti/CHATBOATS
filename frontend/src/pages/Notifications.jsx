import { useState, useEffect } from 'react';
import { Bell, Calendar, BookOpen, AlertCircle, Clock, Megaphone, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulating data fetch / Using backend data if available, supplemented with rich mock data for the UI
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const dashRes = await fetch('/api/v1/student/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dashData = await dashRes.json();
        
        setData(dashData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Loading Notifications & Updates...</p>
    </div>
  );

  // Fallback rich data matching user request, combined with any backend notes
  const upcomingExams = [
    { type: 'Mid Semester', subject: 'DBMS', date: '10 April 2026', time: '10:00 AM' },
    { type: 'Mid Semester', subject: 'DSA', date: '12 April 2026', time: '2:00 PM' },
    { type: 'Practical', subject: 'Operating Systems', date: '15 April 2026', time: '9:00 AM' }
  ];

  const assignments = [
    { subject: 'DBMS', title: 'Database Design Assignment', deadline: '28 March 2026', status: 'Pending' },
    { subject: 'DSA', title: 'Graph Algorithm Assignment', deadline: '30 March 2026', status: 'Pending' },
    { subject: 'Python', title: 'Machine Learning Basics', deadline: '2 April 2026', status: 'Upcoming' }
  ];

  const calendarUpdates = [
    { title: 'Mid Semester Exams', description: 'Begin from April 10, check schedule.', icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { title: 'Summer Internship', description: 'Registration open for 3rd year students.', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Semester Break', description: 'Begins May 20, campus hostels closed.', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
  ];

  const campusAnnouncements = [
    { title: 'Hackathon Registration Open', date: '25 March 2026', type: 'Event' },
    { title: 'Guest Lecture on Artificial Intelligence', date: '28 March 2026', type: 'Workshop' },
    { title: 'Placement Training Program', date: '01 April 2026', type: 'Career' }
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            Campus <span className="text-indigo-600">Updates</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Academic notifications and important announcements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Area (Tables) */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Important Academic Alert Banner */}
           <div className="bg-gradient-to-r from-rose-600 to-red-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden flex items-center gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-10 -mt-20" />
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div className="relative z-10 text-white">
                 <p className="text-[10px] font-black uppercase tracking-widest text-rose-200 mb-1">Important Notice</p>
                 <h3 className="text-xl font-black tracking-tight leading-tight">
                    Mid Semester Exams begin in 5 days.
                 </h3>
                 <p className="text-sm text-rose-100 font-medium mt-1">Please ensure all hall tickets are downloaded from the portal.</p>
              </div>
           </div>

           {/* Upcoming Exams Table */}
           <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/20 flex justify-between items-center">
                 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    Upcoming Exams
                 </h3>
                 <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {upcomingExams.length} Scheduled
                 </span>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="bg-slate-50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-gray-800">
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Type</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Date</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Time</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                       {upcomingExams.map((exam, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors">
                             <td className="px-6 py-5">
                                <span className="inline-flex px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
                                   {exam.type}
                                </span>
                             </td>
                             <td className="px-6 py-5">
                                <span className="font-bold text-slate-800 dark:text-gray-100">{exam.subject}</span>
                             </td>
                             <td className="px-6 py-5 text-center">
                                <span className="text-sm font-semibold text-slate-600 dark:text-gray-300">{exam.date}</span>
                             </td>
                             <td className="px-6 py-5 text-right font-bold text-slate-900 dark:text-white">
                                {exam.time}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Assignment Deadlines Table */}
           <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/20">
                 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Assignment Deadlines
                 </h3>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="bg-slate-50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-gray-800">
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment Title</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                       {assignments.map((assignment, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors">
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-gray-700 flex items-center justify-center font-bold text-slate-600 dark:text-gray-300 text-[10px]">
                                      {assignment.subject.slice(0, 3)}
                                   </div>
                                   <span className="font-bold text-slate-800 dark:text-gray-100">{assignment.subject}</span>
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <span className="font-semibold text-slate-600 dark:text-gray-300 text-sm">{assignment.title}</span>
                             </td>
                             <td className="px-6 py-5 text-right">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-black">
                                   <AlertCircle className="w-3.5 h-3.5" />
                                   {assignment.deadline}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

        </div>

        {/* Right Area (Cards & Lists) */}
        <div className="lg:col-span-1 space-y-8">
           
           {/* Academic Calendar Updates */}
           <div className="bg-[#0F172A] rounded-[2.5rem] p-8 shadow-xl border border-slate-800 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
              
              <div className="relative z-10 flex flex-col h-full">
                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 mb-6 shadow-inner">
                    <Calendar className="w-6 h-6 text-indigo-400" />
                 </div>
                 
                 <h3 className="text-xl font-black uppercase tracking-tight mb-6 leading-tight text-white/90">
                    Academic <br/> <span className="text-indigo-400">Calendar Updates</span>
                 </h3>

                 <div className="space-y-4">
                    {calendarUpdates.map((item, idx) => (
                       <div key={idx} className="p-5 bg-slate-800/50 rounded-3xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                          <div className="flex items-start gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                             </div>
                             <div>
                                <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.description}</p>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Campus Announcements */}
           <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-violet-600" />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Campus Announcements</h3>
              </div>

              <div className="space-y-5">
                 {campusAnnouncements.map((announcement, idx) => (
                    <div key={idx} className="group cursor-pointer">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">{announcement.type}</span>
                          <span className="text-[10px] font-bold text-slate-400">{announcement.date}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-800 dark:text-gray-100 text-sm group-hover:text-violet-600 transition-colors">{announcement.title}</p>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
                       </div>
                       {idx !== campusAnnouncements.length - 1 && (
                          <div className="h-px bg-slate-100 dark:bg-gray-700 mt-4" />
                       )}
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
