import { useState, useEffect } from 'react';
import { Check, X, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function DailyAttendanceLog({ activeSemester }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState(null);
  const [filterDate, setFilterDate] = useState('');

  const HOLIDAYS = {
    '2023-01-26': 'Republic Day', '2023-08-15': 'Independence Day', '2023-10-02': 'Gandhi Jayanti', '2023-11-12': 'Diwali', '2023-12-25': 'Christmas',
    '2024-01-26': 'Republic Day', '2024-03-25': 'Holi Festival', '2024-08-15': 'Independence Day', '2024-10-02': 'Gandhi Jayanti', '2024-10-31': 'Diwali', '2024-12-25': 'Christmas',
    '2025-01-26': 'Republic Day', '2025-08-15': 'Independence Day', '2025-10-02': 'Gandhi Jayanti', '2025-10-20': 'Diwali', '2025-12-25': 'Christmas',
    '2026-01-26': 'Republic Day', '2026-08-15': 'Independence Day', '2026-10-02': 'Gandhi Jayanti', '2026-11-08': 'Diwali', '2026-12-25': 'Christmas'
  };

  const getHolidayName = (dateStr) => {
    if (!dateStr) return null;
    if (HOLIDAYS[dateStr]) return HOLIDAYS[dateStr];
    const date = new Date(dateStr);
    if (date.getDay() === 0) return 'Sunday / Weekly Off';
    return null;
  };

  useEffect(() => {
    const fetchDailyData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/v1/student/daily-attendance', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch daily logs');
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDailyData();
  }, []);

  // Only show the months for the CURRENT selected semester in the cards
  const summaryRecords = records.filter(r => r.semester == (activeSemester || 6));

  // Map Hours 1-8 to Subjects & Labs based on Semester
  const getSubjectForHour = (hour, sem) => {
    const subjects = {
      6: { theory: ['Machine Learning', 'Big Data', 'Cloud Computing', 'Cyber Security', 'Training Session'], labs: ['ML LAB', 'TRAINING SESSION', 'PROJECT LAB'] },
      5: { theory: ['Operating Systems', 'DBMS', 'Web Technologies', 'Java Programming', 'Software Eng.'], labs: ['DBMS LAB', 'JAVA LAB', 'OS LAB'] },
      4: { theory: ['Microprocessors', 'Algorithms', 'Discrete Math', 'Economics', 'COA'], labs: ['ALGO LAB', 'MP LAB', 'HARDWARE LAB'] },
      2: { theory: ['Physics', 'Chemistry', 'Math-II', 'C Programming', 'English'], labs: ['PHYSICS LAB', 'CHEMISTRY LAB', 'C LAB'] },
      1: { theory: ['Math-I', 'English', 'Physics', 'Programming', 'Discrete'], labs: ['MATH LAB', 'ENGLISH LAB', 'PHYSICS LAB'] }
    };

    const config = subjects[sem] || { theory: ['Sub-1', 'Sub-2', 'Sub-3', 'Sub-4', 'Sub-5'], labs: ['LAB-1', 'LAB-2', 'LAB-3'] };

    if (hour <= 5) return config.theory[hour - 1];
    return config.labs[hour - 6]; // Hours 6, 7, 8 map to the 3 labs
  };

  const calculateMonthlyStats = () => {
    const stats = {};
    summaryRecords.forEach(rec => {
      const monthStr = rec.date.split('-')[1];
      const yearStr = rec.date.split('-')[0];
      const key = `${yearStr}-${monthStr}`;

      if (!stats[key]) stats[key] = [];
      const presentCount = rec.hours.filter(h => h.status === 'Present').length;
      stats[key].push((presentCount / 8) * 100);
    });

    return Object.entries(stats).map(([key, values]) => {
      const [year, month] = key.split('-');
      const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
      const dateObj = new Date(parseInt(year), parseInt(month) - 1);
      const name = dateObj.toLocaleString('default', { month: 'long' });
      return { month: name, percentage: avg, id: month, year };
    }).sort((a, b) => a.year - b.year || a.id - b.id);
  };

  const monthlyData = calculateMonthlyStats();

  const filteredRecords = filterDate
    ? records.filter(r => r.date === filterDate)
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Period-Wise Presence History</h3>
          <p className="text-xs text-slate-500 font-medium">Monthly summaries and granular day lookup</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 z-10 pointer-events-none" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none date-input-field"
              min="2023-01-01"
              max="2026-12-31"
            />
          </div>
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Clear</button>
          )}
        </div>
      </div>

      <div className="p-6 min-h-[400px]">
        {!filterDate ? (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Monthly Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthlyData.map((data, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-gray-900/40 p-5 rounded-[2rem] border border-slate-100 dark:border-gray-700 hover:border-blue-500/30 transition-all group shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                      <span className="text-sm font-black text-slate-400 group-hover:text-blue-500 transition-colors">{data.id}</span>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${data.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {data.percentage}%
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">{data.month}</h4>
                  <div className="h-2 w-full bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${data.percentage >= 75 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Academic Attendance</p>
                </div>
              ))}
            </div>

            {/* Hint Box */}
            <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-500/20 group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 group-hover:rotate-12 transition-transform">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Need granular details?</h3>
                    <p className="text-blue-100 text-sm font-medium">Pick a specific date above to see hour-by-hour status.</p>
                  </div>
                </div>
                <div className="hidden lg:block text-right">
                  <p className="text-4xl font-black opacity-20">2026</p>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 leading-none">Academic Cycle</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {/* Filter Results - Priority: Holidays First */}
            {filterDate && getHolidayName(filterDate) ? (
              <div className="p-20 text-center flex flex-col items-center animate-in fade-in zoom-in duration-700 bg-white dark:bg-gray-800 rounded-[3rem] border border-slate-100 dark:border-gray-700 shadow-2xl">
                <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center mb-6 border border-amber-100 dark:border-amber-800/30 shadow-xl shadow-amber-500/10">
                  <Calendar className="w-12 h-12 text-amber-500 animate-bounce" />
                </div>
                <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Institute Calendar</p>
                <h4 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 leading-tight">{getHolidayName(filterDate)}</h4>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm font-semibold text-sm leading-relaxed mb-10 italic">
                  "No classes were conducted today in observance of {getHolidayName(filterDate)}. Happy celebration!"
                </p>
                <button onClick={() => setFilterDate('')} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20">Return to Summary</button>
              </div>
            ) : filteredRecords.length > 0 ? filteredRecords.map((record, idx) => (
              <div
                key={idx}
                className="group border border-slate-100 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 p-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex flex-col items-center justify-center shadow-lg shadow-blue-500/30">
                      <span className="text-xs font-black text-blue-100 uppercase">{new Date(record.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                      <span className="text-2xl font-black text-white">{new Date(record.date).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric' })}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Check className="w-3 h-3 text-emerald-500" /> FULL PERIOD ANALYSIS
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 bg-slate-50 dark:bg-gray-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-gray-700">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                      <p className={`text-2xl font-black ${record.hours.filter(h => h.status === 'Present').length >= 6 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {Math.round((record.hours.filter(h => h.status === 'Present').length / 8) * 100)}%
                      </p>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-200 dark:bg-gray-700 px-0" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <p className={`text-sm font-black uppercase ${record.hours.filter(h => h.status === 'Present').length >= 6 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {record.hours.filter(h => h.status === 'Present').length >= 6 ? 'Safe' : 'Poor'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {record.hours.map((h, i) => (
                    <div key={i} className={`flex flex-col items-center justify-center py-6 px-2 rounded-[2rem] border-2 bg-white dark:bg-gray-800/50 shadow-sm transition-all hover:scale-105 h-full min-h-[160px] ${h.status === 'Present' ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                      <span className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest text-center h-8 flex items-center">
                        {getSubjectForHour(h.hour, record.semester)}
                      </span>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${h.status === 'Present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/20'}`}>
                        {h.status === 'Present' ? <Check className="w-5 h-5 stroke-[4px]" /> : <X className="w-5 h-5 stroke-[4px]" />}
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] font-black uppercase ${h.status === 'Present' ? 'text-emerald-600' : 'text-rose-600'}`}>{h.status}</p>
                        <p className="text-[8px] font-bold text-slate-300 dark:text-gray-600 mt-1">
                          {h.hour > 5 ? 'LAB SESSION' : `PERIOD ${h.hour}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setFilterDate('')}
                  className="mt-10 w-full py-4 bg-slate-50 dark:bg-gray-900 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  Return to Monthly Summary
                </button>
              </div>
            )) : (
              <div className="p-20 text-center flex flex-col items-center animate-in fade-in zoom-in duration-700">
                <>
                  <Calendar className="w-20 h-20 text-slate-200 mb-6" />
                  <h4 className="text-xl font-black text-slate-400 uppercase tracking-tight mb-2 opacity-50">No Data Found</h4>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">Please try a working day (Mon-Sat).</p>
                </>
                <button onClick={() => setFilterDate('')} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20">Return to Overview</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
