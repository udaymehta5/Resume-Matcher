import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart2 } from 'lucide-react';

export default function KeywordChart({ keywords = [] }) {
  if (!keywords || keywords.length === 0) {
    return null;
  }

  const chartData = keywords.map((item) => ({
    keyword: item.keyword.length > 14 ? item.keyword.substring(0, 14) + '...' : item.keyword,
    fullKeyword: item.keyword,
    'Job Description': item.jd_score,
    'Candidate Resume': item.resume_score,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">{data.fullKeyword}</p>
          <p className="text-linkedin-600 dark:text-indigo-400 font-medium">
            Job Description Weight: <span className="font-bold text-slate-900 dark:text-white">{data['Job Description']}%</span>
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
            Resume Weight: <span className="font-bold text-slate-900 dark:text-white">{data['Candidate Resume']}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-linkedin-600 dark:text-indigo-400" />
            <span>Top Keyword Density Comparison</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            TF-IDF vector weights of top terms in Job Description vs Candidate Resume
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-linkedin-600" />
            <span className="text-slate-700 dark:text-slate-300">Job Description</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300">Candidate Resume</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="keyword"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Job Description" fill="#0a66c2" radius={[4, 4, 0, 0]} barSize={14} />
            <Bar dataKey="Candidate Resume" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
