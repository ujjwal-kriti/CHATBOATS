import { User, Hash, Building2, GraduationCap, BookOpen, Phone } from 'lucide-react'

export default function StudentProfileCard({ student }) {
  const details = [
    { icon: Hash, label: 'Registration No.', value: student.registrationNumber },
    { icon: Building2, label: 'Department', value: student.department },
    { icon: GraduationCap, label: 'Year', value: student.year },
    { icon: BookOpen, label: 'Section', value: student.section },
    { icon: Phone, label: 'Parent Phone', value: student.parentPhone },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200/80 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">{student.name}</h2>
            <p className="text-white/90 text-sm">Student Profile</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-gray-100 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
