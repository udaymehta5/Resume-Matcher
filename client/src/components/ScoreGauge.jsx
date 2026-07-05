import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Award } from 'lucide-react';
import { getMatchLabel } from '../utils/matchScore';

export default function ScoreGauge({ score, wordCount }) {
  const status = getMatchLabel(score);
  const StatusIcon = status.icon;

  const data = [
    {
      name: 'Hybrid Score',
      value: score,
      fill: status.color,
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: status.color }}
      />

      <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
        <span className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-300">
          <Award className="w-4 h-4 text-linkedin-600 dark:text-indigo-400" />
          <span>Hybrid Match Score</span>
        </span>
        {wordCount && <span>{wordCount} words</span>}
      </div>

      {/* Recharts Radial Gauge */}
      <div className="w-full h-48 relative flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="92%"
            barSize={16}
            data={data}
            startAngle={210}
            endAngle={-30}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#e2e8f0' }}
              dataKey="value"
              cornerRadius={12}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {score}<span className="text-xl text-slate-500 font-bold">%</span>
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase mt-0.5">
            Hybrid Weighted Score
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${status.bgColor} ${status.borderColor} ${status.textColor}`}
      >
        <StatusIcon className="w-4 h-4" />
        <span>{status.label}</span>
      </div>
    </div>
  );
}
