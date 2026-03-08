import React from 'react';
import { AnalysisResult } from '../types';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
  onSave?: () => void;
  userTier?: string;
}

const AnalysisDashboard: React.FC<Props> = ({ result, onReset, onSave, userTier }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };
  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', icon: 'fa-trophy' };
    if (score >= 50) return { label: 'Needs Work', icon: 'fa-wrench' };
    return { label: 'At Risk', icon: 'fa-triangle-exclamation' };
  };
  const getRingColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };
  const downloadReport = (format: 'json' | 'txt') => {
    const content = format === 'json'
      ? JSON.stringify(result, null, 2)
      : `ATSBeaters Analysis Report
============================
Score: ${result.score}/100
Field: ${result.suggestedJobField}
Date: ${new Date().toLocaleDateString()}

STRENGTHS
---------
${result.strengths.map(function(s, i){ return (i+1) + ". " + s; }).join(String.fromCharCode(10))}

AREAS FOR IMPROVEMENT
---------------------
${result.weaknesses.map(function(s, i){ return (i+1) + ". " + s; }).join(String.fromCharCode(10))}

MISSING KEYWORDS
----------------
${result.missingKeywords.join(", ")}

FORMATTING ISSUES
-----------------
${result.formattingIssues.join(String.fromCharCode(10))}

POWER SENTENCE REWRITES
-----------------------
${result.powerSentenceRewrites.map(function(r, i){ return "BEFORE: " + r.original + String.fromCharCode(10) + "AFTER:  " + r.improved; }).join(String.fromCharCode(10) + String.fromCharCode(10))}

CALLBACK IMPROVEMENT TIP
------------------------
${result.callbackImprovement}
`;
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATSBeaters_Analysis_${Date.now()}.${format}`;
    a.click();
  };

  const circumference = 2 * Math.PI * 40; // ~251.2
  const dashArray = (result.score / 100) * circumference;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── TOP 3 CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">

        {/* CARD 1 — ATS Score */}
        <div className={`p-6 md:p-8 rounded-2xl md:rounded-3xl border ${getScoreColor(result.score)} flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group min-h-[240px]`}>
          <div className="absolute top-0 left-0 w-full h-1 opacity-20 bg-current"></div>
          <span className="text-xs font-black uppercase tracking-widest mb-4 opacity-70 relative z-10">ATS Compliance Score</span>
          {/* Score + SVG ring */}
          <div className="relative flex items-center justify-center w-36 h-36 mb-4">
            <svg className={`absolute inset-0 w-full h-full -rotate-90 ${getRingColor(result.score)}`} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.15" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${dashArray} ${circumference}`}
                strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-5xl md:text-6xl font-black leading-none">{result.score}</span>
              <span className="text-xs opacity-50 font-black">/100</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest opacity-70">
            <i className={`fas ${getScoreLabel(result.score).icon}`}></i>
            <span>{getScoreLabel(result.score).label}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200/50 rounded-full mt-3 overflow-hidden border border-gray-100">
            <div className={`h-full ${getBarColor(result.score)} transition-all duration-1000 shadow-sm`} style={{ width: `${result.score}%` }} />
          </div>
          <p className="mt-4 text-xs font-bold opacity-70 flex items-center gap-2">
            <i className="fas fa-briefcase"></i>
            <span className="truncate max-w-[160px]">{result.suggestedJobField}</span>
          </p>
        </div>

        {/* CARD 2 — Success Impact (rebuilt) */}
        <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-slate-900 text-white flex flex-col justify-between shadow-xl border border-slate-800 min-h-[240px]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-arrow-trend-up text-lg"></i>
            </div>
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Success Impact</span>
          </div>
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="text-3xl md:text-4xl font-black text-white leading-tight line-clamp-2 break-words text-center px-2">
              {result.callbackImprovement}
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed text-center">
            Estimated increase in interview callbacks after implementing these fixes
          </p>
        </div>

        {/* CARD 3 — Action Controls */}
        <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white border border-slate-200 flex flex-col shadow-sm min-h-[240px]">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</span>
            <button onClick={onReset} className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
              <i className="fas fa-rotate-left text-[10px]"></i> New Analysis
            </button>
          </div>
          <div className="flex flex-col gap-2.5 flex-1 justify-center">
            <button onClick={onSave} className="w-full py-3 md:py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-600/20 active:scale-95">
              <i className="fas fa-cloud-arrow-up mr-2"></i> Save to Profile
            </button>
            <button onClick={() => window.print()} className="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center">
              <i className="fas fa-file-export mr-2"></i> Print / Save PDF
            </button>
            <div className="flex w-full border border-slate-100 rounded-xl overflow-hidden">
              <button onClick={() => downloadReport('json')} className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-colors border-r border-slate-100">
                JSON
              </button>
              <button onClick={() => downloadReport('txt')} className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-colors">
                TXT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STRENGTHS + WEAKNESSES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-base md:text-lg font-black mb-4 md:mb-6 flex items-center text-emerald-700">
            <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 flex-shrink-0">
              <i className="fas fa-circle-check text-xs md:text-sm"></i>
            </span>
            What's Working
          </h3>
          <ul className="space-y-2.5">
            {result.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/60 group hover:bg-emerald-50 transition-colors">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-slate-700 leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-base md:text-lg font-black mb-4 md:mb-6 flex items-center text-amber-600">
            <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3 flex-shrink-0">
              <i className="fas fa-circle-exclamation text-xs md:text-sm"></i>
            </span>
            Areas to Improve
          </h3>
          <ul className="space-y-2.5">
            {result.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/40 border border-amber-100/60 group hover:bg-amber-50 transition-colors">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-slate-700 leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── KEYWORDS + FORMATTING ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-black flex items-center text-slate-800">
              <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3 flex-shrink-0">
                <i className="fas fa-tags text-xs md:text-sm"></i>
              </span>
              Critical Keywords Missing
            </h3>
            <button
              onClick={() => navigator.clipboard.writeText(result.missingKeywords.join(', '))}
              className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              <i className="fas fa-copy text-[10px]"></i> Copy All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map((kw, idx) => (
              <span key={idx} className="px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-default">{kw}</span>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400 leading-relaxed italic">These terms appear in 80%+ of job descriptions in your niche.</p>
        </section>
        <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-base md:text-lg font-black mb-4 md:mb-6 flex items-center text-rose-600">
            <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mr-3 flex-shrink-0">
              <i className="fas fa-triangle-exclamation text-xs md:text-sm"></i>
            </span>
            Formatting Violations
          </h3>
          <ul className="space-y-3">
            {result.formattingIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/30 border border-rose-100/50 group hover:bg-rose-50/60 transition-colors">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-slate-600 leading-relaxed">{issue}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── POWER REWRITES ── */}
      <section className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-base md:text-lg font-black mb-6 md:mb-8 flex items-center text-indigo-900">
          <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
            <i className="fas fa-wand-sparkles text-xs md:text-sm"></i>
          </span>
          Strategic Resume Rewrites
        </h3>
        <div className="space-y-5 md:space-y-6">
          {result.powerSentenceRewrites.map((item, idx) => (
            <div key={idx} className="group space-y-3 md:grid md:grid-cols-[1fr_auto_1.2fr] md:gap-4 md:items-center md:space-y-0">
              <div className="p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group-hover:border-slate-200 transition-colors">
                <span className="absolute -top-2 left-4 px-2 bg-slate-200 text-slate-500 text-[10px] font-black rounded uppercase">Before</span>
                <p className="text-sm italic text-slate-400 leading-relaxed mt-1">"{item.original}"</p>
              </div>
              <div className="flex items-center justify-center text-indigo-200 md:flex-col">
                <i className="fas fa-chevron-down text-xl md:hidden"></i>
                <i className="fas fa-chevron-right text-xl hidden md:block"></i>
              </div>
              <div className="p-4 md:p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 relative shadow-sm group-hover:bg-indigo-50 transition-all">
                <span className="absolute -top-2 left-4 px-2 bg-indigo-600 text-white text-[10px] font-black rounded uppercase">ATS Optimized</span>
                <button
                  onClick={() => navigator.clipboard.writeText(item.improved)}
                  className="absolute -top-2 right-4 px-2 bg-white border border-indigo-100 text-indigo-400 text-[10px] font-black rounded hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <i className="fas fa-copy"></i> Copy
                </button>
                <p className="text-sm font-bold text-indigo-900 leading-relaxed mt-1">"{item.improved}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      {(!userTier || userTier === 'free') && (
        <div className="p-7 md:p-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-6 md:gap-0">
          <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10"><i className="fas fa-rocket text-[80px] md:text-[120px]"></i></div>
          <div className="text-center md:text-left relative z-10">
            <h3 className="text-2xl md:text-3xl font-black mb-2 md:mb-3">Maximize Your Potential</h3>
            <p className="text-indigo-100 text-base md:text-lg opacity-90 max-w-md">Our Premium Package users see an average of 3x more interview requests in 30 days.</p>
          </div>
          <button onClick={() => window.open('https://noahbarmash.gumroad.com/l/zeeawh', '_blank')} className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all whitespace-nowrap relative z-10">
            <i className="fas fa-lock-open mr-2"></i> Unlock Pro Features
          </button>
        </div>
      )}
      {(userTier === 'pro' || userTier === 'package') && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
              <i className="fas fa-circle-check"></i>
            </div>
            <div>
              <p className="text-sm font-black text-emerald-800">Analysis Complete</p>
              <p className="text-xs text-emerald-600">Implement these changes and re-scan to track your improvement.</p>
            </div>
          </div>
          <button onClick={onReset} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-colors">
            Scan Again
          </button>
        </div>
      )}

    </div>
  );
};

export default AnalysisDashboard;
