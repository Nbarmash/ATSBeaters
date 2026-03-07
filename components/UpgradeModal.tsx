import React from 'react';
import { FeatureName, AccessReason } from '../hooks/useFeatureAccess';

const GUMROAD_PRO_URL = 'https://noahbarmash.gumroad.com/l/zeeawh';
const GUMROAD_PACKAGE_URL = 'https://noahbarmash.gumroad.com/l/cpbvb';

const FEATURE_COPY: Record<FeatureName, { title: string; description: string }> = {
  analyzer:           { title: 'ATS Resume Scanner',         description: 'Instantly score your resume against any job description.' },
  rewrite:            { title: 'AI Resume Optimizer',        description: 'Rewrite your resume with AI to pass ATS filters.' },
  cover_letter:       { title: 'Cover Letter Generator',     description: 'Generate a tailored cover letter for any job in seconds.' },
  keywords:           { title: 'Keyword Extractor',          description: 'Pull the exact keywords recruiters are searching for.' },
  ats_check:          { title: 'ATS Compatibility Check',    description: 'Verify your resume parses cleanly through ATS systems.' },
  quantifier:         { title: 'Achievement Quantifier',     description: 'Transform vague bullets into measurable accomplishments.' },
  summary:            { title: 'Summary Generator',          description: 'Craft a compelling professional summary for your resume.' },
  skills:             { title: 'Skills Optimizer',           description: 'Identify and format your best skills for ATS scoring.' },
  headshot:           { title: 'AI Headshot Enhancer',       description: 'Professionally enhance your LinkedIn photo with AI.' },
  interview_prep:     { title: 'Interview Prep AI',          description: 'Practice answers to the toughest interview questions.' },
  salary_negotiation: { title: 'Salary Negotiation Tool',    description: 'Get a personalized script to negotiate your best offer.' },
  linkedin_optimizer: { title: 'LinkedIn Profile Optimizer', description: 'Optimize every section of your LinkedIn for maximum visibility.' },
};

interface UpgradeModalProps {
  feature: FeatureName;
  reason: AccessReason;
  requiredTier: 'free' | 'pro' | 'package';
  onDismiss: () => void;
  onLogin?: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  feature,
  reason,
  requiredTier,
  onDismiss,
  onLogin,
}) => {
  const copy = FEATURE_COPY[feature];
  const isAuthWall = reason === 'not_authenticated';
  const isLimitReached = reason === 'limit_reached';
  const upgradeUrl = requiredTier === 'package' ? GUMROAD_PACKAGE_URL : GUMROAD_PRO_URL;
  const planName = requiredTier === 'package' ? 'Career Suite' : 'Pro';
  const planPrice = requiredTier === 'package' ? '$29/mo' : '$12/mo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onDismiss}
      />
      <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5 mx-auto">
          <i className="fas fa-lock text-2xl text-indigo-500" />
        </div>

        <h2 className="text-xl font-black text-slate-900 text-center mb-1">
          {isAuthWall ? 'Sign in to continue' : isLimitReached ? 'Free limit reached' : 'Upgrade to ' + planName}
        </h2>

        <p className="text-sm font-bold text-indigo-600 text-center mb-1">{copy.title}</p>
        <p className="text-sm text-slate-500 text-center mb-6">{copy.description}</p>

        {isAuthWall && (
          <p className="text-xs text-center text-slate-400 bg-slate-50 rounded-xl px-4 py-3 mb-6">
            Create a free account to use the ATS Scanner and Resume Optimizer. Upgrade anytime for full access.
          </p>
        )}
        {isLimitReached && (
          <p className="text-xs text-center text-slate-400 bg-amber-50 rounded-xl px-4 py-3 mb-6">
            You've used all your free analyses. Upgrade to{' '}
            <span className="font-bold text-amber-600">Pro</span> for unlimited scans.
          </p>
        )}
        {!isAuthWall && !isLimitReached && (
          <p className="text-xs text-center text-slate-400 bg-indigo-50 rounded-xl px-4 py-3 mb-6">
            This feature is included in the{' '}
            <span className="font-bold text-indigo-600">{planName}</span> plan &mdash; {planPrice}.
          </p>
        )}

        {isAuthWall ? (
          <button
            onClick={onLogin}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-200 mb-3"
          >
            Sign In / Create Account
          </button>
        ) : (
          <a
            href={upgradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm text-center transition-all active:scale-95 shadow-lg shadow-indigo-200 mb-3"
          >
            Upgrade Now &mdash; {planName} {planPrice}
          </a>
        )}

        <button
          onClick={onDismiss}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default UpgradeModal;
