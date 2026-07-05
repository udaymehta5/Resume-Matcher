import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Wand2, Users, X } from 'lucide-react';

const SAMPLE_JD = `We are seeking a Senior Full Stack Software Engineer to join our growing tech team. 
Key Responsibilities:
- Design and develop scalable web applications using React, Node.js, Express, and Python (FastAPI).
- Architect databases using MongoDB, PostgreSQL, and Redis caching.
- Build RESTful APIs and microservices with clean code principles.
- Implement containerized deployments using Docker, Kubernetes, and AWS (EC2, S3).
- Utilize Git for version control and manage CI/CD pipelines via GitHub Actions.
- Collaborate in an Agile/Scrum environment with strong communication, problem solving, and leadership skills.

Required Technical Skills:
Python, React, Node.js, Express, MongoDB, Docker, AWS, Git, REST API, JavaScript, TypeScript, Tailwind CSS, Scikit-learn, Agile, Teamwork.`;

export default function UploadForm({ onAnalyzeSingle, onAnalyzeBatch, isLoading, error }) {
  const [mode, setMode] = useState('single'); // 'single' | 'batch'
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const handleFilesAdded = (incomingFiles) => {
    setValidationError('');
    if (!incomingFiles || incomingFiles.length === 0) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];

    const validFiles = [];
    let err = '';

    for (const f of incomingFiles) {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      if (!allowedTypes.includes(f.type) && !validExtensions.includes(ext)) {
        err = `Invalid format for ${f.name}. PDF or DOCX only.`;
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        err = `File ${f.name} exceeds 10MB size limit.`;
        continue;
      }
      validFiles.push(f);
    }

    if (err && validFiles.length === 0) {
      setValidationError(err);
      return;
    }

    if (mode === 'single') {
      setFiles([validFiles[0]]);
    } else {
      setFiles((prev) => {
        const combined = [...prev, ...validFiles];
        return combined.slice(0, 10);
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (files.length === 0) {
      setValidationError('Please upload at least one candidate resume (PDF or DOCX).');
      return;
    }

    if (!jobDescription.trim()) {
      setValidationError('Please paste or enter a Job Description.');
      return;
    }

    if (mode === 'single') {
      onAnalyzeSingle(files[0], jobDescription.trim());
    } else {
      onAnalyzeBatch(files, jobDescription.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Match & Rank Candidate Resumes
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          TF-IDF vector space analysis, spaCy lemmatization, skill categorization, and candidate ranking.
        </p>
      </div>

      {/* Mode Selector Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-x-1">
          <button
            type="button"
            onClick={() => {
              setMode('single');
              if (files.length > 1) setFiles([files[0]]);
            }}
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'single'
                ? 'bg-linkedin-600 text-white shadow-md shadow-linkedin-600/30'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Single Resume Evaluation</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'batch'
                ? 'bg-linkedin-600 text-white shadow-md shadow-linkedin-600/30'
                : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Batch Candidate Leaderboard (2-10 Resumes)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Upload Box */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">
                1. {mode === 'single' ? 'Upload Resume' : 'Upload Candidate Resumes (2-10)'} <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Accepts PDF or DOCX documents (max 10MB each)</p>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
                  dragActive
                    ? 'border-linkedin-600 bg-linkedin-50 dark:bg-indigo-500/10'
                    : files.length > 0
                    ? 'border-emerald-500/60 bg-emerald-500/5'
                    : 'border-slate-300 dark:border-slate-800 hover:border-linkedin-500 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={mode === 'batch'}
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => handleFilesAdded(Array.from(e.target.files))}
                  className="hidden"
                />

                {files.length > 0 ? (
                  <div className="w-full space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {files.length} {files.length === 1 ? 'Resume' : 'Resumes'} Staged
                    </p>

                    {/* File Chips */}
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {files.map((f, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs shadow-sm"
                        >
                          <span className="truncate text-slate-800 dark:text-slate-200 max-w-[180px] font-medium">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-xs text-linkedin-600 dark:text-indigo-400 hover:underline font-semibold block mx-auto pt-1"
                    >
                      + Add more resumes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-center">
                    <div className="w-12 h-12 rounded-xl bg-linkedin-50 dark:bg-indigo-500/10 border border-linkedin-200 dark:border-indigo-500/20 flex items-center justify-center mx-auto text-linkedin-600 dark:text-indigo-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                        {mode === 'single' ? 'Drop resume file here' : 'Drop candidate resumes here'} or <span className="text-linkedin-600 dark:text-indigo-400 underline">browse</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF or DOCX files</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Description Text Box */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200">
                  2. Paste Job Description <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setJobDescription(SAMPLE_JD)}
                  className="flex items-center space-x-1 text-xs text-linkedin-600 dark:text-indigo-400 hover:underline font-semibold transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Insert Sample JD</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Target job requirements & responsibilities</p>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                rows={8}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-linkedin-600 focus:ring-1 focus:ring-linkedin-600 resize-none font-sans"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{jobDescription.length} characters</span>
              <span>{jobDescription.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        </div>

        {/* Error Notifications */}
        {(validationError || error) && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-linkedin-600 hover:bg-linkedin-700 text-white font-bold text-sm shadow-xl shadow-linkedin-600/30 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running TF-IDF & spaCy Analysis...</span>
              </>
            ) : mode === 'single' ? (
              <>
                <FileText className="w-5 h-5 text-white" />
                <span>Analyze & Match Resume</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5 text-white" />
                <span>Generate Candidate Leaderboard ({files.length} Resumes)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
