import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadForm from './components/UploadForm';
import ResultsDashboard from './components/ResultsDashboard';
import BatchLeaderboard from './components/BatchLeaderboard';
import HistoryList from './components/HistoryList';
import { analyzeResumeAPI, analyzeBatchResumesAPI } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [currentResult, setCurrentResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleAnalyzeSingle = async (file, jobDescription) => {
    setIsLoading(true);
    setError(null);
    setBatchResult(null);

    try {
      const data = await analyzeResumeAPI(file, jobDescription);
      setCurrentResult(data);
    } catch (err) {
      console.error('Single analysis error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to analyze resume. Please check if backend services are running.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeBatch = async (files, jobDescription) => {
    setIsLoading(true);
    setError(null);
    setCurrentResult(null);

    try {
      const data = await analyzeBatchResumesAPI(files, jobDescription);
      setBatchResult({
        ...data,
        jobDescription,
      });
    } catch (err) {
      console.error('Batch analysis error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to analyze batch resumes.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentResult(null);
    setBatchResult(null);
    setError(null);
  };

  const handleSelectHistoryItem = (item) => {
    setCurrentResult({
      ...item,
      matchScore: item.matchScore,
      matchedSkills: item.matchedSkills,
      missingSkills: item.missingSkills,
      resumeWordCount: item.resumeWordCount,
      topKeywords: item.topKeywords,
    });
    setBatchResult(null);
    setActiveTab('analyze');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'analyze' && !currentResult && !batchResult) {
            setError(null);
          }
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analyze' ? (
          batchResult ? (
            <BatchLeaderboard batchResult={batchResult} onReset={handleReset} />
          ) : currentResult ? (
            <ResultsDashboard result={currentResult} onReset={handleReset} />
          ) : (
            <UploadForm
              onAnalyzeSingle={handleAnalyzeSingle}
              onAnalyzeBatch={handleAnalyzeBatch}
              isLoading={isLoading}
              error={error}
            />
          )
        ) : (
          <HistoryList onSelectResult={handleSelectHistoryItem} />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          Resume Matcher • Classical ML/NLP Stack (TF-IDF + Cosine Similarity + spaCy)
        </p>
      </footer>
    </div>
  );
}
