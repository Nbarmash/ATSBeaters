h380

import React, { useState, useCallback, useEffect } from 'react';
import { AppTab, AnalysisState, User, HistoryEntry } from './types';
import * as api from './services/geminiService';
import * as auth from './services/authService';
import { SAMPLES } from './components/Samples';
import AnalysisDashboard from './components/AnalysisDashboard';
import PhotoEditor from './components/PhotoEditor';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(auth.getCurrentUser());
  const [activeTab, setActiveTab] = useState<AppTab>(user ? AppTab.DASHBOARD : AppTab.ANALYZER);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [state, setState] = useState<AnalysisState>({ isAnalyzing: false, result: null, error: null });
  const [showPricing, setShowPricing] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const runService = async () => {
        // Guest user access enabled - free tier testing allowed
    if (user.credits <= 0 && user.tier === 'free') { setShowPricing(true); return; }

    setState({ isAnalyzing: true, result: null, error: null });
    try {
      let result;
      switch (activeTab) {
        case AppTab.ANALYZER: result = await api.analyzeResume(input1); break;
        case AppTab.REWRITE: result = await api.rewriteFullResume(input1, input2); break;
        case AppTab.QUICK_REWRITE: result = await api.quickRewrite(input1); break;
        case AppTab.COVER_LETTER: result = await api.generateCoverLetter(input1, input2); break;
        case AppTab.KEYWORDS: result = await api.extractKeywords(input1); break;
        case AppTab.ATS_CHECK: result = await api.checkATSCompatibility(input1); break;
        case AppTab.QUANTIFIER: result = await api.quantifyAchievements(input1); break;
        case AppTab.SUMMARY: result = await api.generateSummary(input1); break;
        case AppTab.SKILLS: result = await api.optimizeSkills(input1); break;
      }
      setState({ isAnalyzing: false, result, error: null });
    } catch (err: any) {
      setState({ isAnalyzing: false, result: null, error: err.message || 'Service failed' });
    }
  };

  const handleSave = () => {
    if (state.result) {
      auth.saveToHistory({ type: activeTab, input: input1, result: state.result });
      setUser(auth.getCurrentUser());
      alert("Successfully saved to your profile!");
    }
  };

  const handleReset = useCallback(() => {
    setInput1('');
    setInput2('');
    setState({ isAnalyzing: false, result: null, error: null });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string || 'Career Pro';
    const loggedInUser = auth.login(email, name);
    setUser(loggedInUser);
    setAuthMode(null);
    setActiveTab(AppTab.DASHBOARD);
  };

  const menuItems = [
    { id: AppTab.DASHBOARD, label: 'Performance', icon: 'fa-house-user' },
    { id: AppTab.ANALYZER, label: 'Resume Analysis', icon: 'fa-microscope' },
    { id: AppTab.REWRITE, label: 'Full Rewrite', icon: 'fa-pen-to-square' },
    { id: AppTab.QUICK_REWRITE, label: 'Quick Optimize', icon: 'fa-bolt-lightning' },
    { id: AppTab.COVER_LETTER, label: 'Cover Letter', icon: 'fa-envelope-open-text' },
    { id: AppTab.KEYWORDS, label: 'Market Keywords', icon: 'fa-magnifying-glass-chart' },
    { id: AppTab.ATS_CHECK, label: 'ATS Health', icon: 'fa-clipboard-check' },
    { id: AppTab.QUANTIFIER, label: 'Metrics Builder', icon: 'fa-chart-simple' },
    { id: AppTab.SUMMARY, label: 'Summary Gen', icon: 'fa-user-gear' },
    { id: AppTab.SKILLS, label: 'Skills Studio', icon: 'fa-layer-group' },
    { id: AppTab.PHOTO_EDITOR, label: 'Headshot AI', icon: 'fa-camera-retro' },
    { id: AppTab.HELP, label: 'Help & FAQ', icon: 'fa-circle-question' },
  ];

  const renderAuth = () => (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 border border-slate-100">
        <button onClick={() => setAuthMode(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500"><i className="fas fa-times text-xl"></i></button>
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-xl shadow-indigo-600/20">
            <i className="fas fa-fingerprint"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">{authMode === 'login' ? 'Welcome Back' : 'Get Started'}</h2>
          <p className="text-slate-500 font-medium leading-relaxed">Join 20k+ job seekers beating the bots daily.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          {authMode === 'signup' && (
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input name="name" type="text" placeholder="Full Name" required className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-100 outline-none font-medium text-slate-700" />
            </div>
          )}
          <div className="relative">
             <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
             <input name="email" type="email" placeholder="Email Address" required className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-indigo-100 outline-none font-medium text-slate-700" />
          </div>
          <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/10 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
            {authMode === 'login' ? 'Login to Dashboard' : 'Create Free Account'}
          </button>
        </form>
        <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col items-center space-y-4">
           <p className="text-sm text-slate-400 font-medium">By continuing, you agree to our Terms of Service.</p>
           <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-indigo-600 font-bold hover:underline">
              {authMode === 'login' ? "New here? Create account" : "Already registered? Login here"}
           </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!user) return null;
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
        {/* Analytics Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full"></div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Member Level</p>
            <p className="text-3xl font-black text-slate-900 capitalize">{user.tier}</p>
            <button onClick={() => setShowPricing(true)} className="mt-4 text-xs font-bold text-indigo-600 hover:underline">Manage Subscription →</button>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Insights</p>
            <p className="text-3xl font-black text-slate-900">{user.history.length}</p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-5 overflow-hidden">
               <div className="h-full bg-slate-300 w-3/4"></div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Success Velocity</p>
            <p className="text-3xl font-black text-emerald-500">+42%</p>
            <p className="text-[10px] font-bold text-slate-400 mt-4 italic">Above platform average</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Credits Remaining</p>
            <p className="text-3xl font-black text-slate-900">{user.credits}</p>
            <button className="mt-4 text-xs font-bold text-amber-600 hover:underline">Purchase More →</button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* History List */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-2xl text-slate-900">Career History</h3>
              <div className="flex space-x-2">
                 <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"><i className="fas fa-filter"></i></button>
                 <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"><i className="fas fa-arrow-down-wide-short"></i></button>
              </div>
            </div>
            <div className="divide-y divide-slate-50 flex-1">
              {user.history.length > 0 ? user.history.map(h => (
                <div key={h.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => { setActiveTab(h.type); setInput1(h.input); setState({ isAnalyzing: false, result: h.result, error: null }); }}>
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                      <i className={`fas ${menuItems.find(m => m.id === h.type)?.icon} text-xl`}></i>
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-800">{menuItems.find(m => m.id === h.type)?.label}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{new Date(h.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    {h.result?.score && (
                      <div className="text-right">
                        <p className="text-2xl font-black text-indigo-600">{h.result.score}%</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase">Match Score</p>
                      </div>
                    )}
                    <i className="fas fa-chevron-right text-slate-200 group-hover:text-indigo-400 transition-colors"></i>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center text-slate-300">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-folder-open text-4xl opacity-40"></i>
                  </div>
                  <h4 className="text-xl font-bold text-slate-400">Your archive is empty</h4>
                  <p className="text-sm mt-2 max-w-xs mx-auto">Start optimizing your resume to see your progress here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Social Proof & Stats Sidebar */}
          <div className="space-y-8">
             <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/30">
                <div className="relative z-10">
                   <div className="flex items-center space-x-2 mb-6">
                      {[1,2,3,4,5].map(s => <i key={s} className="fas fa-star text-amber-400 text-xs"></i>)}
                      <span className="text-[10px] font-black tracking-widest opacity-70">VERIFIED USER</span>
                   </div>
                   <p className="text-xl font-bold leading-relaxed mb-6">"Within 48 hours of using ATSBeaters, I landed 3 interviews at top tech firms. The keyword extractor is a cheat code."</p>
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-white/20"></div>
                      <div>
                        <p className="font-bold text-sm">Alex Chen</p>
                        <p className="text-[10px] opacity-60 font-bold uppercase">Senior Product Designer</p>
                      </div>
                   </div>
                </div>
                <i className="fas fa-quote-right absolute -right-4 -bottom-4 text-[120px] text-white/10"></i>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px] border-b border-slate-50 pb-4">Community Stats</h4>
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500">Users Hired</span>
                      <span className="text-lg font-black text-slate-800">14.2k+</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500">Avg Score Boost</span>
                      <span className="text-lg font-black text-emerald-500">+28 pts</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500">Time Saved/User</span>
                      <span className="text-lg font-black text-indigo-600">6.4 hrs</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHelp = () => (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Support Center</h2>
        <p className="text-slate-500 text-lg">Master the art of beating the ATS bots.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-xl mb-6 text-indigo-600 uppercase tracking-tight">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-2">What is an ATS score?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">It's a compliance rating based on how well an automated system can parse your text and match it to specific job requirements.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-2">How many resumes can I analyze?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Free users get 1 analysis per month. Pro and Package tiers have unlimited monthly credits.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Can I export my results?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Yes! You can export to PDF, JSON, or copy the content directly to your clipboard for use in external editors.</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-xl mb-6 text-slate-800 uppercase tracking-tight">Contact Support</h3>
          <form className="space-y-4">
            <input type="text" placeholder="Subject" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium focus:ring-4 focus:ring-indigo-100 outline-none" />
            <textarea placeholder="Describe your issue..." className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium focus:ring-4 focus:ring-indigo-100 outline-none resize-none"></textarea>
            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all">Send Message</button>
          </form>
          <div className="mt-8 flex items-center justify-center space-x-6 text-slate-400">
             <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-twitter text-xl"></i></a>
             <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-linkedin text-xl"></i></a>
             <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fas fa-envelope text-xl"></i></a>
          </div>
        </section>
      </div>
    </div>
  );

  const renderInput = () => {
    if (activeTab === AppTab.DASHBOARD) return renderDashboard();
    if (activeTab === AppTab.PHOTO_EDITOR) return <PhotoEditor />;
    if (activeTab === AppTab.HELP) return renderHelp();

    const configs: Record<string, any> = {
      [AppTab.ANALYZER]: { title: "Resume Auditor", label1: "Paste Resume Content", placeholder1: "Paste your resume here (No contact info needed)...", btn: "Run Analysis" },
      [AppTab.REWRITE]: { title: "ATS Overhaul", label1: "Paste Resume", placeholder1: "Your current resume...", label2: "Specific Goals or Job Desc", placeholder2: "Help us tailor the content...", btn: "Complete Rewrite" },
      [AppTab.QUICK_REWRITE]: { title: "Rapid Optimizer", label1: "Content Snippet", placeholder1: "Paste any section or the whole thing...", btn: "Flash Rewrite" },
      [AppTab.COVER_LETTER]: { title: "Cover Letter Sculptor", label1: "Your Resume", placeholder1: "Paste resume...", label2: "Job Description", placeholder2: "Paste job description...", btn: "Craft Letter" },
      [AppTab.KEYWORDS]: { title: "Market Insight", label1: "Job Description", placeholder1: "The posting you're targeting...", btn: "Extract Intelligence" },
      [AppTab.ATS_CHECK]: { title: "Health Scanner", label1: "Resume Content", placeholder1: "Verify fonts and layout...", btn: "Scan Compliance" },
      [AppTab.QUANTIFIER]: { title: "Metric Lab", label1: "Weak Bullets", placeholder1: "e.g. 'I managed people'...", btn: "Inject Metrics" },
      [AppTab.SUMMARY]: { title: "Identity Generator", label1: "Background/Highlights", placeholder1: "Summary of your career...", btn: "Design Summary" },
      [AppTab.SKILLS]: { title: "Skills Architect", label1: "Raw Skills", placeholder1: "Paste your unstructured skills...", btn: "Rebuild Section" },
    };

    const config = configs[activeTab];
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center mb-8">
           <h2 className="text-4xl font-black text-slate-900 mb-2">{config.title}</h2>
           <p className="text-slate-500 font-medium">Expert AI optimization for your professional documents.</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <label className="text-xs font-black text-slate-300 uppercase tracking-widest">{config.label1}</label>
             <div className="flex space-x-2">
            <button onClick={() => setInput1(SAMPLES.tech)} className="text-[10px] bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl font-black">Sample: Tech</button>             </div>
          </div>
          <textarea 
            value={input1} onChange={(e) => setInput1(e.target.value)}
            placeholder={config.placeholder1}
            className="w-full h-64 p-6 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-100 outline-none text-sm font-medium text-slate-700 leading-relaxed resize-none transition-all placeholder:text-slate-300"
          />
          {config.label2 && (
            <div className="mt-8">
              <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-4">{config.label2}</label>
              <textarea 
                value={input2} onChange={(e) => setInput2(e.target.value)}
                placeholder={config.placeholder2}
                className="w-full h-40 p-6 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-100 outline-none text-sm font-medium text-slate-700 leading-relaxed resize-none transition-all placeholder:text-slate-300"
              />
            </div>
          )}
          <button 
            onClick={runService} disabled={!input1.trim() || state.isAnalyzing}
            className={`mt-10 w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center space-x-3 ${input1.trim() && !state.isAnalyzing ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`}
          >
            {state.isAnalyzing ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <i className="fas fa-microchip"></i>}
            <span>{state.isAnalyzing ? 'Decoding Career Path...' : config.btn}</span>
          </button>
        </div>

        {state.result && activeTab !== AppTab.ANALYZER && (
           <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
              <h3 className="text-2xl font-black text-slate-900">Optimization Result</h3>
              <div className="flex space-x-3">
                 <button onClick={() => { navigator.clipboard.writeText(typeof state.result === 'string' ? state.result : JSON.stringify(state.result)); alert("Copied to clipboard!"); }} className="text-xs font-black text-indigo-600 px-5 py-2.5 rounded-xl border border-indigo-100 hover:bg-indigo-50 flex items-center transition-all active:scale-95">
                    <i className="fas fa-copy mr-2"></i> Copy
                 </button>
                 <button onClick={handleSave} className="text-xs font-black text-emerald-600 px-5 py-2.5 rounded-xl border border-emerald-100 hover:bg-emerald-50 flex items-center transition-all active:scale-95">
                    <i className="fas fa-floppy-disk mr-2"></i> Save Profile
                 </button>
              </div>
            </div>
            <div className="prose max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed font-medium text-base p-2">
              {typeof state.result === 'string' ? state.result : JSON.stringify(state.result, null, 2)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {authMode && renderAuth()}
      {showPricing && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-12 relative max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-100">
            <button onClick={() => setShowPricing(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500 transition-colors"><i className="fas fa-times text-2xl"></i></button>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 mb-3">Professional Plans</h2>
              <p className="text-slate-500 font-medium text-lg">Invest in your career. Get hired 2x faster.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { tier: 'free', price: '$0', title: 'Free Tier', features: ['1 Audit/mo', 'Basic Suggestions', 'Email Alerts'], btn: 'Current', current: user?.tier === 'free' },
                { tier: 'pro', price: '$12', title: 'Pro Pack', features: ['Unlimited Audits', 'Full Rewrites', 'Keyword Insights', 'PDF Exports'], btn: 'Upgrade', popular: true, current: user?.tier === 'pro' },
                { tier: 'package', price: '$24', title: 'Career Suite', features: ['Everything in Pro', 'Cover Letter Gen', 'Photo AI Edit', 'Direct Support'], btn: 'Go Ultimate', current: user?.tier === 'package' },
              ].map((plan, i) => (
                <div key={i} className={`p-8 rounded-[2rem] border-2 transition-all ${plan.popular ? 'border-indigo-600 scale-105 shadow-2xl shadow-indigo-600/10' : 'border-slate-100'} flex flex-col relative`}>
                  {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest shadow-lg">HIGHLY RECOMMENDED</span>}
                  <h3 className="text-xl font-black text-slate-900 mb-2">{plan.title}</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-sm font-bold text-slate-400 ml-1">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map(f => <li key={f} className="text-sm font-medium text-slate-600 flex items-center"><i className="fas fa-circle-check text-emerald-500 mr-3"></i> {f}</li>)}
                  </ul>
                  <button 
                    onClick={() => { if (plan.tier !== 'free') { setUser(auth.upgradeTier(plan.tier as any)); setShowPricing(false); } }}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${plan.current ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/10' : 'bg-slate-900 text-white hover:bg-black'}`}
                  >
                    {plan.current ? 'Active Now' : plan.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Dynamic Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-slate-100 px-6 md:px-12 py-5 flex items-center justify-between no-print">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab(user ? AppTab.DASHBOARD : AppTab.ANALYZER)}>
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
            <i className="fas fa-ghost text-xl"></i>
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-900">ATSBEATERS</h1>
        </div>

        <div className="flex items-center space-x-6">
          <nav className="hidden lg:flex items-center space-x-8 mr-6 border-r border-slate-100 pr-8">
             <button onClick={() => setShowPricing(true)} className="text-sm font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Pricing</button>
             <button onClick={() => setActiveTab(AppTab.HELP)} className="text-sm font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">FAQ</button>
          </nav>
          
          {user && (
            <div className="flex items-center space-x-5">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-slate-900">{user.name}</p>
                <div className="flex items-center justify-end space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{user.tier} PASS</span>
                </div>
              </div>
              <button onClick={() => { auth.logout(); setUser(null); setActiveTab(AppTab.ANALYZER); }} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95 shadow-sm border border-slate-100">
                <i className="fas fa-power-off"></i>
              </button>
            </div>
            <div className="flex space-x-3">
          )

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
             <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars-staggered'}`}></i>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Navigation Sidebar (Overlay) */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <aside className="w-72 h-full bg-white p-8 animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
               <div className="space-y-2">
                 {menuItems.map(item => (
                   <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); handleReset(); }} className={`w-full flex items-center px-5 py-4 text-sm font-black rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                     <i className={`fas ${item.icon} w-6 mr-4`}></i> {item.label}
                   </button>
                 ))}
               </div>
            </aside>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-100 p-6 hidden md:block overflow-y-auto no-scrollbar no-print">
          <div className="mb-10 px-4">
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Platform Core</h2>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id} onClick={() => { setActiveTab(item.id); handleReset(); }}
                className={`w-full flex items-center px-5 py-4 text-sm font-black rounded-2xl transition-all group ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <i className={`fas ${item.icon} w-6 mr-4 text-xl group-hover:scale-110 transition-transform`}></i> 
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === AppTab.PHOTO_EDITOR && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-600 text-[8px] rounded-md font-black">NEW</span>}
              </button>
            ))}
          </nav>
          
          <div className="mt-16 p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-3">Community</p>
                <h4 className="font-black text-base mb-6 leading-tight">Join the hiring revolution.</h4>
                <button className="text-xs font-black text-slate-900 bg-white hover:bg-indigo-50 w-full py-3.5 rounded-xl transition-all active:scale-95">Invite Friends</button>
             </div>
             <i className="fas fa-users absolute -right-6 -bottom-6 text-[100px] text-white/10 group-hover:scale-110 transition-transform"></i>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
          <div className="max-w-6xl mx-auto pb-24">
            {activeTab === AppTab.ANALYZER && state.result ? (
              <AnalysisDashboard result={state.result} onReset={handleReset} onSave={handleSave} />
            ) : renderInput()}
          </div>
        </main>
      </div>
      
      <footer className="py-8 border-t border-slate-100 bg-white no-print">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs font-bold">
          <div className="flex items-center space-x-6 mb-6 md:mb-0">
             <span className="text-slate-600">ATSBeaters AI © 2024</span>
             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
             <span>Trusted by 20,000+ Professionals</span>
          </div>
          <div className="flex space-x-10 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Career Blog</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Affiliate</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
