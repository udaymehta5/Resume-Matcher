import React, { useState } from 'react';
import { Trophy, Medal, Award, CheckCircle2, XCircle, ArrowLeft, FileText, Eye, RefreshCw } from 'lucide-react';
import ResultsDashboard from './ResultsDashboard';

export default function BatchLeaderboard({ batchResult, onReset }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  if (!batchResult || !batchResult.candidates) return null;

  const { candidates, totalCandidates, jobDescription } = batchResult;

  if (selectedCandidate) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedCandidate(null)}
          className="flex items-center space-x-2 text-xs font-bold text-linkedin-600 dark:text-indigo-400 hover:underline glass-panel px-3 py-1.5 rounded-xl border border-linkedin-200 dark:border-indigo-500/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Leaderboard</span>
        </button>

        <ResultsDashboard
          result={{
            ...selectedCandidate,
            jobDescription,
          }}
          onReset={() => setSelectedCandidate(null)}
        />
      </div>
    );
  }

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-extrabold text-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>#1 Top Rank</span>
        </span>
      );
    } else if (rank === 2) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-300/10 border border-slate-300 dark:border-slate-300/30 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
          <Medal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
          <span>#2 Strong Match</span>
        </span>
      );
    } else if (rank === 3) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-700 dark:text-orange-300 font-extrabold text-xs">
          <Award className="w-3.5 h-3.5 text-orange-500" />
          <span>#3 Candidate</span>
        </span>
      );
    } else {
      return (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          Rank #{rank}
        </span>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Recruiter Candidate Leaderboard</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {totalCandidates} candidates evaluated & ranked via TF-IDF cosine similarity
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-linkedin-600 hover:bg-linkedin-700 text-white text-xs font-bold shadow-lg shadow-linkedin-600/30 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Batch Analysis</span>
        </button>
      </div>

      {/* Candidates Leaderboard Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Candidate Resume</th>
                <th className="py-4 px-6">TF-IDF Match Score</th>
                <th className="py-4 px-6">Skills Matched</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
              {candidates.map((cand) => {
                const score = cand.match_score;
                const scoreColor =
                  score >= 75
                    ? 'text-emerald-700 dark:text-emerald-400 font-black'
                    : score >= 50
                    ? 'text-amber-700 dark:text-amber-400 font-black'
                    : 'text-rose-700 dark:text-rose-400 font-bold';

                const matchedCount = cand.matched_skills?.length || 0;
                const missingCount = cand.missing_skills?.length || 0;

                return (
                  <tr
                    key={cand.filename}
                    onClick={() => setSelectedCandidate(cand)}
                    className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6">{getRankBadge(cand.rank)}</td>
                    
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-200 group-hover:text-linkedin-600 dark:group-hover:text-indigo-300 transition-colors">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-linkedin-600 dark:text-indigo-400 flex-shrink-0" />
                        <span className="truncate max-w-xs">{cand.candidate_name || cand.filename}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className={`text-base ${scoreColor}`}>{score}%</span>
                        <div className="w-24 bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800 hidden sm:block">
                          <div
                            className="h-full bg-linkedin-600 rounded-full"
                            style={{ width: `${Math.min(score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                        <span className="flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{matchedCount} Matched</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="flex items-center space-x-1 text-rose-700 dark:text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{missingCount} Missing</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(cand);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-linkedin-50 dark:bg-indigo-600/10 hover:bg-linkedin-100 dark:hover:bg-indigo-600/20 text-linkedin-700 dark:text-indigo-300 border border-linkedin-200 dark:border-indigo-500/30 text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
