import { AlertCircle, Calendar, FileText } from 'lucide-react';

const iconMap = {
  attendance: AlertCircle,
  exam: Calendar,
  assignment: FileText,
};

const colorMap = {
  attendance: 'bg-amber-100 text-amber-800 border-amber-200',
  exam: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function AcademicAlerts({ alerts }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm p-5 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-primary-500" />
        Academic Alerts
      </h3>
      <div className="space-y-3">
        {alerts?.map((alert, index) => {
          const Icon = iconMap[alert.type] || AlertCircle;
          const colorClass = colorMap[alert.type] || 'bg-slate-100 text-slate-800 border-slate-200';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border ${colorClass}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-xs opacity-90 mt-0.5">{alert.message}</p>
                {alert.date && (
                  <p className="text-xs mt-1 opacity-75">{alert.date}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
