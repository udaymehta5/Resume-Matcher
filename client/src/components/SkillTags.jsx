import React, { useState } from 'react';
import { CheckCircle2, XCircle, Search, Sparkles } from 'lucide-react';

export default function SkillTags({
  matchedSkills = [],
  missingSkills = [],
  matchedHardSkills = [],
  missingHardSkills = [],
  matchedSoftSkills = [],
  missingSoftSkills = [],
  categorizedMatched = {},
  categorizedMissing = {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    'All',
    'Programming Languages',
    'Frameworks & Web',
    'Databases & Caching',
    'Cloud & DevOps',
    'Tools & Methodology',
    'Marketing & Growth',
    'Sales & Business Development',
    'UI/UX & Design',
    'Finance & Accounting',
    'Operations & HR',
    'Soft Skills'
  ];

  const filterSkills = (skillsList, categorizedDict) => {
    return skillsList.filter((skill) => {
      const matchesSearch = skill.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (activeCategory === 'All') return true;

      const categorySkills = categorizedDict[activeCategory] || [];
      return categorySkills.includes(skill);
    });
  };

  const filteredMatched = filterSkills(matchedSkills, categorizedMatched);
  const filteredMissing = filterSkills(missingSkills, categorizedMissing);

  const activeMatchedHard = matchedHardSkills.length > 0 ? matchedHardSkills : matchedSkills;
  const activeMissingHard = missingHardSkills.length > 0 ? missingHardSkills : missingSkills;

  const totalHardSkills = activeMatchedHard.length + activeMissingHard.length;
  const hardMatchRate = totalHardSkills > 0 ? Math.round((activeMatchedHard.length / totalHardSkills) * 100) : 0;

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Skill Keyword Extraction & Categorization</span>
            <span className="text-xs bg-linkedin-50 dark:bg-indigo-500/10 border border-linkedin-200 dark:border-indigo-500/20 text-linkedin-700 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">
              {hardMatchRate}% Hard Skill Coverage ({activeMatchedHard.length}/{totalHardSkills})
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hard technical tools and soft skills categorized via spaCy NLP and domain-adaptive taxonomy
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter skills..."
            className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-linkedin-600 font-sans"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-linkedin-600 text-white shadow-md shadow-linkedin-600/30'
                : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Two Column Skill Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills Column (Green) */}
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-emerald-500 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched Skills ({filteredMatched.length})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
            {filteredMatched.length > 0 ? (
              filteredMatched.map((skill, idx) => {
                const isSoft = matchedSoftSkills.includes(skill) || categorizedMatched['Soft Skills']?.includes(skill);
                return (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      isSoft
                        ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {skill} {isSoft ? '(soft skill)' : ''}
                  </span>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                {searchTerm || activeCategory !== 'All' ? 'No matching skills in this category' : 'No required skills matched'}
              </p>
            )}
          </div>
        </div>

        {/* Missing Skills Column (Red) */}
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-rose-500 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
              <XCircle className="w-4 h-4" />
              <span>Missing Skills ({filteredMissing.length})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
            {filteredMissing.length > 0 ? (
              filteredMissing.map((skill, idx) => {
                const isSoft = missingSoftSkills.includes(skill) || categorizedMissing['Soft Skills']?.includes(skill);
                return (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      isSoft
                        ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    {skill} {isSoft ? '(soft skill)' : ''}
                  </span>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                {searchTerm || activeCategory !== 'All' ? 'No missing skills in this category' : 'No missing skills detected! Great fit!'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
