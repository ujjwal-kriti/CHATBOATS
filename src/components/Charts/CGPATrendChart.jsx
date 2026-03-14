import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function CGPATrendChart({ data }) {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="cgpaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
          <XAxis
            dataKey="semester"
            className="text-xs"
            tick={{ fill: '#64748b' }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#64748b' }}
            className="text-xs"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value) => [value, 'CGPA']}
          />
          <Area
            type="monotone"
            dataKey="cgpa"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#cgpaGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
