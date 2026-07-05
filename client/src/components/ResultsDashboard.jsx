import React from 'react';
import { ArrowLeft, FileText, Download, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Award, Sparkles } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import SkillTags from './SkillTags';
import KeywordChart from './KeywordChart';
import ResumeHealthCard from './ResumeHealthCard';

export default function ResultsDashboard({ result, onReset }) {
  if (!result) return null;

  const {
    filename,
    matchScore,
    matchedSkills = [],
    missingSkills = [],
    categorizedMatched = {},
    categorizedMissing = {},
    resumeWordCount = 0,
    resumeHealth = null,
    topKeywords = [],
    jobDescription,
    createdAt
  } = result;

  const totalSkills = matchedSkills.length + missingSkills.length;
  const matchRate = totalSkills > 0 ? Math.round((matchedSkills.length / totalSkills) * 100) : 0;

  // Determine overall Job Match Fit Verdict
  const getMatchVerdict = (score, matched, missing) => {
    if (score >= 80 || (matched.length >= 6 && missing.length <= 2)) {
      return {
        verdict: 'PERFECT MATCH FOR THIS JOB',
        subtext: 'This candidate is an exceptional fit. High keyword overlap and satisfies almost all core technical and soft skill requirements.',
        color: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon: CheckCircle2,
      };
    } else if (score >= 60 || matched.length > missing.length) {
      return {
        verdict: 'STRONG CANDIDATE FIT',
        subtext: 'The candidate meets key foundational requirements for the role. Moderate overlap with job description keywords.',
        color: 'text-linkedin-700 dark:text-indigo-400',
        bg: 'bg-linkedin-50 dark:bg-indigo-500/10',
        border: 'border-linkedin-200 dark:border-indigo-500/30',
        icon: Award,
      };
    } else if (score >= 40) {
      return {
        verdict: 'MODERATE / PARTIAL MATCH',
        subtext: `Candidate possesses some relevant experience but is missing critical skills (${missing.slice(0, 3).join(', ')}).`,
        color: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: AlertTriangle,
      };
    } else {
      return {
        verdict: 'LOW MATCH FOR THIS JOB',
        subtext: 'Low textual and skill overlap with the target job description. Lacks key required technologies.',
        color: 'text-rose-700 dark:text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        icon: XCircle,
      };
    }
  };

  const verdict = getMatchVerdict(matchScore, matchedSkills, missingSkills);
  const VerdictIcon = verdict.icon;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            title="New Analysis"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-linkedin-600 dark:text-indigo-400" />
              <span className="truncate max-w-md">{filename || 'Candidate Resume'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analyzed on {createdAt ? new Date(createdAt).toLocaleString() : 'Just now'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-linkedin-50 dark:bg-indigo-600/20 hover:bg-linkedin-100 text-linkedin-700 dark:text-indigo-300 text-xs font-bold border border-linkedin-200 dark:border-indigo-500/30 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Analyze Another Resume</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print / Export Report</span>
          </button>
        </div>
      </div>

      {/* Prominent Job Match Verdict Banner */}
      <div className={`p-5 rounded-2xl border ${verdict.bg} ${verdict.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm`}>
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-xl ${verdict.bg} border ${verdict.border} ${verdict.color}`}>
            <VerdictIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">Job Fit Evaluation:</span>
              <h3 className={`text-base font-black tracking-tight ${verdict.color}`}>
                {verdict.verdict} ({matchScore}% Match)
              </h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium max-w-3xl">
              {verdict.subtext}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-4 h-4 text-linkedin-600 dark:text-indigo-400" />
          <div className="text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Skills Coverage</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {matchedSkills.length} of {totalSkills} Skills ({matchRate}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Score Gauge + Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreGauge score={matchScore} wordCount={resumeWordCount} />

        {/* Quick Stats Panel */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">TF-IDF & NLP Analysis Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates bi-gram term frequency, inverse document frequency, and spaCy entity recognition.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Match Percentage</span>
              <span className="text-2xl font-extrabold text-linkedin-600 dark:text-indigo-400">{matchScore}%</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Skills Coverage</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{matchRate}%</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Skills Match Count</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-200">
                <span className="text-emerald-600 dark:text-emerald-400">{matchedSkills.length}</span> / <span className="text-rose-600 dark:text-rose-400">{missingSkills.length}</span>
              </span>
              <span className="text-[10px] text-slate-500 block">Matched / Missing</span>
            </div>
          </div>

          {/* Actionable Skill Advice */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {matchedSkills.length > 0 ? (
              <p>✅ <strong>Matched Key Skills:</strong> {matchedSkills.slice(0, 8).join(', ')}.</p>
            ) : null}
            {missingSkills.length > 0 ? (
              <p className="mt-1 text-rose-700 dark:text-rose-400">⚠️ <strong>Missing Key Job Requirements:</strong> {missingSkills.slice(0, 6).join(', ')}.</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Resume Health Diagnostics */}
      {resumeHealth && <ResumeHealthCard health={resumeHealth} />}

      {/* Categorized Skill Tags Comparison */}
      <SkillTags
        matchedSkills={matchedSkills}
        missingSkills={missingSkills}
        categorizedMatched={categorizedMatched}
        categorizedMissing={categorizedMissing}
      />

      {/* TF-IDF Top Keyword Comparison Chart */}
      <KeywordChart keywords={topKeywords} />

      {/* Job Description Preview Card */}
      {jobDescription && (
        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Target Job Description</h4>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
            {jobDescription}
          </div>
        </div>
      )}
    </div>
  );
}
