
export interface AnalysisResult {
  score: number;
  formattingIssues: string[];
  missingKeywords: string[];
  powerSentenceRewrites: { original: string; improved: string }[];
  callbackImprovement: string;
  strengths: string[];
  weaknesses: string[];
  suggestedJobField: string;
  timestamp?: number;
}

// Added missing KeywordResult interface to match geminiService schema
export interface KeywordResult {
  hardSkills: string[];
  softSkills: string[];
  priorityKeywords: string[];
  industryTerms: string[];
}

// Added missing ATSCompatibilityResult interface to match geminiService schema
export interface ATSCompatibilityResult {
  parseScore: number;
  issues: string[];
  structureRating: string;
  fontCheck: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'package';
  credits: number;
  history: HistoryEntry[];
  joinedAt: number;
}

export interface HistoryEntry {
  id: string;
  type: AppTab;
  input: string;
  result: any;
  timestamp: number;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: any | null;
  error: string | null;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  ANALYZER = 'analyzer',
  REWRITE = 'rewrite',
  QUICK_REWRITE = 'quick_rewrite',
  COVER_LETTER = 'cover_letter',
  KEYWORDS = 'keywords',
  ATS_CHECK = 'ats_check',
  QUANTIFIER = 'quantifier',
  SUMMARY = 'summary',
  SKILLS = 'skills',
  PHOTO_EDITOR = 'photo_editor',
  HELP = 'help'
}
