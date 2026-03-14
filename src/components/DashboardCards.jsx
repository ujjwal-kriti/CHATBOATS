import { CalendarCheck, Award, AlertCircle, CreditCard } from 'lucide-react'

const cardConfig = [
  {
    title: 'Attendance %',
    valueKey: 'attendancePercentage',
    icon: CalendarCheck,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Current CGPA',
    valueKey: 'cgpa',
    icon: Award,
    color: 'from-indigo-500 to-violet-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    title: 'Backlogs',
    valueKey: 'backlogsCount',
    icon: AlertCircle,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Pending Fees',
    valueKey: 'pendingFees',
    icon: CreditCard,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
]

export default function DashboardCards({ data }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfig.map(({ title, valueKey, icon: Icon, color, bgColor, iconColor }) => (
        <div
          key={title}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200/80 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-xl ${bgColor}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-gray-100">
              {valueKey === 'pendingFees' ? `₹${data[valueKey] || '0'}` : (valueKey === 'attendancePercentage' ? `${data[valueKey]}%` : data[valueKey])}
            </span>
          </div>
          <h3 className="mt-3 text-sm font-medium text-slate-500 dark:text-gray-400">{title}</h3>
        </div>
      ))}
    </div>
  )
}
