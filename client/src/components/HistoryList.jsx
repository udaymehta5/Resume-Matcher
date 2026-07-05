import React, { useState, useEffect } from 'react';
import { History, Search, Trash2, Calendar, FileText, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchHistoryAPI, deleteHistoryItemAPI } from '../api';

export default function HistoryList({ onSelectResult }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchHistoryAPI();
      setHistory(response.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Could not connect to database or backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis record?')) return;

    try {
      await deleteHistoryItemAPI(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert('Failed to delete history item.');
    }
  };

  const filteredHistory = history.filter(
    (item) =>
      item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-linkedin-600 dark:text-indigo-400" />
            <span>Analysis History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Past candidate resume evaluation reports stored in database
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history..."
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-linkedin-600 w-full sm:w-60 font-sans"
            />
          </div>

          <button
            onClick={loadHistory}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-linkedin-600 dark:text-indigo-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fetching past evaluation records...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-3 border-rose-500/20">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm text-rose-600 dark:text-rose-300 font-semibold">{error}</p>
          <button
            onClick={loadHistory}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">No History Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'No historical evaluations match your search query.'
              : 'You have not evaluated any resumes yet. Switch to "Analyze Resume" tab to begin.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredHistory.map((item) => {
            const score = item.matchScore;
            const scoreColor =
              score >= 75
                ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : score >= 50
                ? 'text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
                : 'text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/10';

            return (
              <div
                key={item._id}
                onClick={() => onSelectResult(item)}
                className="glass-panel p-4 rounded-xl hover:border-linkedin-500/50 cursor-pointer transition-all duration-200 group flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${scoreColor}`}
                  >
                    <span className="text-sm font-black">{score}%</span>
                    <span className="text-[9px] uppercase font-bold tracking-tight">Match</span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-linkedin-600 dark:group-hover:text-indigo-300 transition-colors truncate">
                      {item.filename || 'Candidate Resume'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-lg font-medium">
                      {item.jobDescription}
                    </p>
                    <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-0.5">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span>•</span>
                      <span>{item.matchedSkills?.length || 0} skills matched</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleDelete(e, item._id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-linkedin-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
