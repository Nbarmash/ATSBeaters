
import React from 'react';
import { AnalysisResult } from '../types';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
  onSave?: () => void;
}

const AnalysisDashboard: React.FC<Props> = ({ result, onReset, onSave }) => {
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

  const downloadReport = (format: 'json' | 'txt') => {
    const content = format === 'json' ? JSON.stringify(result, null, 2) : 
      `ATSBeaters Report\nScore: ${result.score}/100\nField: ${result.suggestedJobField}\n\nMissing Keywords: ${result.missingKeywords.join(', ')}\n\nFormatting Issues:\n${result.formattingIssues.join('\n')}`;
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATSBeaters_Analysis_${Date.now()}.${format}`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score */}
        <div className={`p-8 rounded-3xl border ${getScoreColor(result.score)} flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group`}>
          <div className="absolute top-0 left-0 w-full h-1 opacity-20 bg-current"></div>
          <span className="text-xs font-black uppercase tracking-widest mb-2 opacity-70">ATS Compliance Score</span>
          <div className="text-7xl font-black mb-3 group-hover:scale-110 transition-transform">{result.score}<span className="text-2xl opacity-50">/100</span></div>
          <div className="w-full h-3 bg-gray-200/50 rounded-full mt-2 overflow-hidden border border-gray-100">
            <div className={`h-full ${getBarColor(result.score)} transition-all duration-1000 shadow-sm`} style={{ width: `${result.score}%` }} />
          </div>
          <p className="mt-5 text-sm font-bold opacity-80 flex items-center">
            <i className="fas fa-briefcase mr-2"></i>
            {result.suggestedJobField}
          </p>
        </div>

        {/* Growth Metric */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center text-center shadow-xl border border-slate-800">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
             <i className="fas fa-arrow-trend-up text-xl"></i>
          </div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Success Impact</span>
          <div className="text-5xl font-black mb-2 text-white">{result.callbackImprovement}</div>
          <p className="text-xs text-slate-400 leading-relaxed px-4">Estimated increase in interview callbacks after implementing fixes</p>
        </div>

        {/* Action Controls */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm space-y-3">
          <button onClick={onSave} className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-600/10 active:scale-95">
            <i className="fas fa-cloud-arrow-up mr-2"></i> Save to Profile
          </button>
          <button onClick={() => window.print()} className="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center">
            <i className="fas fa-file-export mr-2"></i> Export to PDF
          </button>
          <div className="grid grid-cols-2 gap-2 w-full">
            <button onClick={() => downloadReport('json')} className="py-2 text-[10px] font-black uppercase text-slate-400 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">JSON</button>
            <button onClick={() => downloadReport('txt')} className="py-2 text-[10px] font-black uppercase text-slate-400 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">Text</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black mb-6 flex items-center text-slate-800">
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3"><i className="fas fa-tags text-sm"></i></span>
            Critical Keywords Missing
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map((kw, idx) => (
              <span key={idx} className="px-4 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-default">{kw}</span>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-400 leading-relaxed italic">These terms appear in 80%+ of job descriptions in your niche.</p>
        </section>

        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black mb-6 flex items-center text-rose-600">
            <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mr-3"><i className="fas fa-triangle-exclamation text-sm"></i></span>
            Formatting Violations
          </h3>
          <ul className="space-y-4">
            {result.formattingIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start text-sm text-slate-600 bg-rose-50/30 p-3 rounded-xl border border-rose-100/50">
                <i className="fas fa-circle-xmark text-rose-400 mt-1 mr-3"></i>
                <span className="font-medium">{issue}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-black mb-8 flex items-center text-indigo-900">
          <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3"><i className="fas fa-wand-sparkles text-sm"></i></span>
          Strategic Resume Rewrites
        </h3>
        <div className="space-y-6">
          {result.powerSentenceRewrites.map((item, idx) => (
            <div key={idx} className="group grid grid-cols-1 md:grid-cols-[1fr_auto_1.2fr] gap-4 items-center">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group-hover:border-slate-200 transition-colors">
                <span className="absolute -top-2 left-4 px-2 bg-slate-200 text-slate-500 text-[10px] font-black rounded uppercase">Before</span>
                <p className="text-sm italic text-slate-400 leading-relaxed">"{item.original}"</p>
              </div>
              <div className="hidden md:flex flex-col items-center text-indigo-200">
                 <i className="fas fa-chevron-right text-xl"></i>
              </div>
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 relative shadow-sm group-hover:bg-indigo-50 transition-all">
                <span className="absolute -top-2 left-4 px-2 bg-indigo-600 text-white text-[10px] font-black rounded uppercase">ATS Optimized</span>
                <p className="text-sm font-bold text-indigo-900 leading-relaxed">"{item.improved}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="p-10 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><i className="fas fa-rocket text-[120px]"></i></div>
        <div className="mb-8 md:mb-0 text-center md:text-left relative z-10">
          <h3 className="text-3xl font-black mb-3">Maximize Your Potential</h3>
          <p className="text-indigo-100 text-lg opacity-90 max-w-md">Our Premium Package users see an average of 3x more interview requests in 30 days.</p>
        </div>
        <button className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all whitespace-nowrap relative z-10">
          Unlock Pro Features
        </button>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
