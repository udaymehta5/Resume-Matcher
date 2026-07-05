import React from 'react';
import { ArrowLeft, FileText, Download, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import SkillTags from './SkillTags';
import KeywordChart from './KeywordChart';
import ResumeHealthCard from './ResumeHealthCard';
import { getMatchLabel } from '../utils/matchScore';

export default function ResultsDashboard({ result, onReset }) {
  if (!result) return null;

  const {
    filename,
    matchScore,
    matchedSkills = [],
    missingSkills = [],
    matched_hard_skills,
    matchedHardSkills = matched_hard_skills || [],
    missing_hard_skills,
    missingHardSkills = missing_hard_skills || [],
    matched_soft_skills,
    matchedSoftSkills = matched_soft_skills || [],
    missing_soft_skills,
    missingSoftSkills = missing_soft_skills || [],
    hard_skills_coverage,
    hardSkillsCoverage = hard_skills_coverage,
    low_skill_count_warning,
    lowSkillCountWarning = low_skill_count_warning,
    categorizedMatched = {},
    categorizedMissing = {},
    resumeWordCount = 0,
    resumeHealth = null,
    topKeywords = [],
    jobDescription,
    createdAt
  } = result;

  // Use Hard Skills for primary technical coverage metric if available
  const activeMatchedHard = matchedHardSkills.length > 0 || missingHardSkills.length > 0 ? matchedHardSkills : matchedSkills;
  const activeMissingHard = matchedHardSkills.length > 0 || missingHardSkills.length > 0 ? missingHardSkills : missingSkills;
  
  const totalHardSkills = activeMatchedHard.length + activeMissingHard.length;
  const hardMatchRate = hardSkillsCoverage !== undefined 
    ? Math.round(hardSkillsCoverage) 
    : (totalHardSkills > 0 ? Math.round((activeMatchedHard.length / totalHardSkills) * 100) : 0);

  // Single Canonical Source of Truth for Match Labels
  const verdict = getMatchLabel(matchScore);
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

      {/* Warning banner if low skill count detected in JD */}
      {lowSkillCountWarning && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2.5 font-semibold">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{lowSkillCountWarning}</span>
        </div>
      )}

      {/* Prominent Job Match Verdict Banner */}
      <div className={`p-5 rounded-2xl border ${verdict.bgColor} ${verdict.borderColor} flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm`}>
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-xl ${verdict.bgColor} border ${verdict.borderColor} ${verdict.textColor}`}>
            <VerdictIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">Job Fit Evaluation:</span>
              <h3 className={`text-base font-black tracking-tight ${verdict.textColor}`}>
                {verdict.verdictText} ({matchScore}% Match)
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
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Hard Skills Coverage</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {activeMatchedHard.length} of {totalHardSkills} Skills ({hardMatchRate}%)
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
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Hybrid Score</span>
              <span className="text-2xl font-extrabold text-linkedin-600 dark:text-indigo-400">{matchScore}%</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Hard Skills Coverage</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{hardMatchRate}%</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Hard Skills Match</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-200">
                <span className="text-emerald-600 dark:text-emerald-400">{activeMatchedHard.length}</span> / <span className="text-rose-600 dark:text-rose-400">{activeMissingHard.length}</span>
              </span>
              <span className="text-[10px] text-slate-500 block">Matched / Missing</span>
            </div>
          </div>

          {/* Actionable Skill Advice */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium space-y-1.5">
            {activeMatchedHard.length > 0 && (
              <p>✅ <strong>Matched Hard Skills:</strong> {activeMatchedHard.slice(0, 8).join(', ')}.</p>
            )}
            {activeMissingHard.length > 0 && (
              <p className="text-rose-700 dark:text-rose-400">⚠️ <strong>Missing Key Job Requirements (Hard Skills):</strong> {activeMissingHard.slice(0, 6).join(', ')}.</p>
            )}
            {missingSoftSkills.length > 0 && (
              <p className="text-amber-700 dark:text-amber-400 text-[11px]">💡 <strong>Soft Skills Note:</strong> Desired traits not explicitly mentioned in resume: {missingSoftSkills.join(', ')}.</p>
            )}
          </div>
        </div>
      </div>

      {/* Resume Health Diagnostics */}
      {resumeHealth && <ResumeHealthCard health={resumeHealth} />}

      {/* Categorized Skill Tags Comparison */}
      <SkillTags
        matchedSkills={matchedSkills}
        missingSkills={missingSkills}
        matchedHardSkills={matchedHardSkills}
        missingHardSkills={missingHardSkills}
        matchedSoftSkills={matchedSoftSkills}
        missingSoftSkills={missingSoftSkills}
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
