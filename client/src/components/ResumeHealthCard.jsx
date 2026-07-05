import React from 'react';
import { Activity, CheckCircle2, AlertCircle, FileText, Zap, TrendingUp } from 'lucide-react';

export default function ResumeHealthCard({ health }) {
  if (!health) return null;

  const { health_score, word_count, action_verb_count, has_metrics, tips = [] } = health;

  const getHealthColor = (score) => {
    if (score >= 85) return { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 65) return { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const badge = getHealthColor(health_score);

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-linkedin-600 dark:text-indigo-400" />
            <span>Resume Structure & Formatting Diagnostics</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluates word count optimal length, action verb density, and impact metrics
          </p>
        </div>

        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${badge.bg} ${badge.border} ${badge.color}`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-xs font-extrabold">{health_score}/100 Health Score</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Word Count</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{word_count} words</span>
          </div>
          <FileText className="w-5 h-5 text-linkedin-600 dark:text-indigo-400/60" />
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Action Verbs</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{action_verb_count} verbs</span>
          </div>
          <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400/60" />
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Metrics Present</span>
            <span className={`text-xs font-bold ${has_metrics ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {has_metrics ? 'Yes (% / $)' : 'None Detected'}
            </span>
          </div>
          {has_metrics ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400/60" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400/60" />
          )}
        </div>
      </div>

      {/* Formatting & Optimization Tips */}
      {tips.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-300 block">Diagnostic Recommendations:</span>
          <div className="space-y-1">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
