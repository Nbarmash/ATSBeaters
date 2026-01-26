
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, KeywordResult, ATSCompatibilityResult } from "../types";

// Always use the process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    formattingIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    powerSentenceRewrites: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          improved: { type: Type.STRING }
        },
        required: ["original", "improved"]
      }
    },
    callbackImprovement: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedJobField: { type: Type.STRING }
  },
  required: ["score", "formattingIssues", "missingKeywords", "powerSentenceRewrites", "callbackImprovement", "strengths", "weaknesses", "suggestedJobField"]
};

const KEYWORD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    hardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    priorityKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    industryTerms: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["hardSkills", "softSkills", "priorityKeywords", "industryTerms"]
};

const ATS_CHECK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    parseScore: { type: Type.INTEGER },
    issues: { type: Type.ARRAY, items: { type: Type.STRING } },
    structureRating: { type: Type.STRING },
    fontCheck: { type: Type.STRING }
  },
  required: ["parseScore", "issues", "structureRating", "fontCheck"]
};

const QUANTIFIER_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      original: { type: Type.STRING },
      quantified: { type: Type.STRING }
    },
    required: ["original", "quantified"]
  }
};

export const analyzeResume = async (content: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this resume for ATS compatibility: ${content}`,
    config: { responseMimeType: "application/json", responseSchema: RESUME_SCHEMA }
  });
  return JSON.parse(response.text || '{}');
};

export const rewriteFullResume = async (content: string, analysis?: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Rewrite the following resume to be highly ATS-optimized. 
    Use strong action verbs, quantify achievements, and integrate relevant keywords.
    ${analysis ? `Use this analysis context: ${analysis}` : ''}
    
    Resume Content:
    ${content}`,
  });
  return response.text || '';
};

export const quickRewrite = async (content: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Quickly optimize this resume content for ATS systems. Improve verbs and keywords. 
    Content: ${content}`,
  });
  return response.text || '';
};

export const generateCoverLetter = async (resume: string, jobDesc: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a professional cover letter based on this resume and job description.
    Resume: ${resume}
    Job Description: ${jobDesc}`,
  });
  return response.text || '';
};

export const extractKeywords = async (jobDesc: string): Promise<KeywordResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract keywords and skills from this job description: ${jobDesc}`,
    config: { responseMimeType: "application/json", responseSchema: KEYWORD_SCHEMA }
  });
  return JSON.parse(response.text || '{}');
};

export const checkATSCompatibility = async (content: string): Promise<ATSCompatibilityResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Check if this resume formatting parses correctly in ATS (fonts, tables, characters): ${content}`,
    config: { responseMimeType: "application/json", responseSchema: ATS_CHECK_SCHEMA }
  });
  return JSON.parse(response.text || '{}');
};

export const quantifyAchievements = async (bullets: string): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transform these weak bullet points into strong achievement statements with metrics: ${bullets}`,
    config: { responseMimeType: "application/json", responseSchema: QUANTIFIER_SCHEMA }
  });
  return JSON.parse(response.text || '[]');
};

export const generateSummary = async (content: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a compelling 3-4 sentence professional summary based on this resume: ${content}`,
  });
  return response.text || '';
};

export const optimizeSkills = async (content: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Optimize this skills section for ATS relevance and readability. Categorize them logically.
    Skills/Content: ${content}`,
  });
  return response.text || '';
};

export const editProfessionalPhoto = async (base64Image: string, prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: `Edit this professional headshot: ${prompt}.` }
      ]
    }
  });
  // Iterating through all parts to find the image part as per guidelines
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image returned");
};
