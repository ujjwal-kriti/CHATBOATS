import { User, Hash, Building2, GraduationCap, BookOpen, Phone, MapPin, BadgeCheck } from 'lucide-react'

export default function StudentProfileCard({ student }) {
  // Helper to format semester label
  const getSemesterLabel = (sem) => {
    if (!sem) return 'N/A';
    const num = parseInt(sem);
    if (isNaN(num)) return sem;
    const year = Math.ceil(num / 2);
    const suffix = year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th';
    return `${year}${suffix} Year - Sem ${num}`;
  };

  const details = [
    { icon: Hash, label: 'Reg ID', value: student.registrationNumber, color: 'text-blue-400' },
    { icon: Building2, label: 'Dept', value: student.department || 'CSE', color: 'text-indigo-400' },
    { icon: GraduationCap, label: 'Academic', value: getSemesterLabel(student.semester || 6), color: 'text-violet-400' },
    { icon: BookOpen, label: 'Sec', value: student.section || 'A', color: 'text-emerald-400' },
    { icon: Phone, label: 'Parent', value: student.parentPhone || 'N/A', color: 'text-rose-400' },
  ]

  return (
    <div className="relative bg-white dark:bg-[#0F172A] rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden transition-all duration-500 group">
      {/* Texture Layer - No size change */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      
      <div className="relative px-6 py-4 sm:px-8 sm:py-6">
        <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          {/* Profile Section */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform duration-500">
                <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-[0.9rem] flex items-center justify-center transition-colors">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-[#0F172A] rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">{student.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-100 dark:border-blue-500/20">
                  Student
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{student.registrationNumber}</span>
              </div>
            </div>
          </div>

          {/* Details Bar - Strictly same grid */}
          <div className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-white/10 pt-4 lg:pt-0 lg:pl-10">
            {details.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="group/item flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-md transition-all">
                <div className={`w-8 h-8 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${color.replace('400', '600')}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-xs font-black text-slate-700 dark:text-white truncate tracking-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
