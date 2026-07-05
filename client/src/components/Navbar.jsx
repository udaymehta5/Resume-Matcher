import React from 'react';
import { Sparkles, History, FileText, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-linkedin-600 flex items-center justify-center shadow-lg shadow-linkedin-600/30">
            <Sparkles className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Resume Matcher
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">TF-IDF & spaCy NLP Resume Matcher</p>
          </div>
        </div>

        {/* Right Actions: Navigation Tabs + Theme Toggle */}
        <div className="flex items-center space-x-3">
          <nav className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'analyze'
                  ? 'bg-linkedin-600 text-white shadow-md shadow-linkedin-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Analyze Resume</span>
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-linkedin-600 text-white shadow-md shadow-linkedin-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </nav>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-linkedin-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
