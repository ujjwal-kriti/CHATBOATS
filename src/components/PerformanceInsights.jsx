import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';

export default function PerformanceInsights({ insights }) {
  if (!insights) return null;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm p-5 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary-500" />
        Performance Insights
      </h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-emerald-800 uppercase tracking-wide">Strong Subject</p>
            <p className="font-semibold text-emerald-900">{insights.strongSubject}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 border border-rose-200">
          <TrendingDown className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-rose-800 uppercase tracking-wide">Weak Subject</p>
            <p className="font-semibold text-rose-900">{insights.weakSubject}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary-50 border border-primary-200">
          <Lightbulb className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-primary-800 uppercase tracking-wide">AI Suggestion</p>
            <p className="text-slate-700 dark:text-gray-300">{insights.suggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
