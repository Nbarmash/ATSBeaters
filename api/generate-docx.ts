══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════───────────────────────✓───────────────────────•⚠───────────────────────•───────────────────────•─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────═══════════════════════════════════════════════════════════·═══════════════════════════════════════════════════════════✅⚠️🎯🔧🤝💡📌📄–👻···👻·✅•⚠️•🎯🔧🤝💡📌📄·—import type { VercelRequest, VercelResponse } from '@vercel/node';

// Phase 2: Generate a plain-text ATS report for download
// Returns a .txt file with the full analysis formatted for readability
// (Pure Node.js - no external dependencies needed)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { result, serviceType, input } = req.body;

  if (!result) {
    return res.status(400).json({ error: 'Missing result data' });
  }

  const serviceLabel: Record<string, string> = {
    analyzer: 'Resume Analysis',
    rewrite: 'Full Rewrite',
    quick_rewrite: 'Quick Optimize',
    cover_letter: 'Cover Letter',
    keywords: 'Market Keywords',
    ats_check: 'ATS Health Check',
    quantifier: 'Metrics Builder',
    summary: 'Summary Generator',
    skills: 'Skills Studio',
  };

  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const label = serviceLabel[serviceType] || 'Analysis';

  // Build plain text report
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('  ATSBEATERS - ' + label.toUpperCase() + ' REPORT');
  lines.push('  Generated: ' + now);
  lines.push('  Website: atsbeaters.com');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');

  // Score section
  if (result.score != null) {
    const scoreLabel = result.score >= 80 ? 'EXCELLENT' : result.score >= 60 ? 'NEEDS WORK' : 'AT RISK';
    lines.push('ATS COMPATIBILITY SCORE');
    lines.push('───────────────────────');
    lines.push(`  Score: ${result.score}% [${scoreLabel}]`);
    if (result.suggestedJobField) {
      lines.push(`  Target Field: ${result.suggestedJobField}`);
    }
    lines.push('');
  }

  // Strengths
  if (result.strengths && result.strengths.length > 0) {
    lines.push('WHAT\'S WORKING ✓');
    lines.push('───────────────────────');
    result.strengths.forEach((s: string) => lines.push(`  • ${s}`));
    lines.push('');
  }

  // Weaknesses
  if (result.weaknesses && result.weaknesses.length > 0) {
    lines.push('AREAS TO IMPROVE ⚠');
    lines.push('───────────────────────');
    result.weaknesses.forEach((w: string) => lines.push(`  • ${w}`));
    lines.push('');
  }

  // Formatting issues
  if (result.formattingIssues && result.formattingIssues.length > 0) {
    lines.push('FORMATTING ISSUES');
    lines.push('───────────────────────');
    result.formattingIssues.forEach((f: string) => lines.push(`  • ${f}`));
    lines.push('');
  }

  // Missing keywords
  if (result.missingKeywords && result.missingKeywords.length > 0) {
    lines.push('MISSING KEYWORDS');
    lines.push('───────────────────────');
    lines.push('  ' + result.missingKeywords.join(', '));
    lines.push('');
  }

  // Power rewrites
  if (result.powerSentenceRewrites && result.powerSentenceRewrites.length > 0) {
    lines.push('POWER SENTENCE REWRITES');
    lines.push('───────────────────────');
    result.powerSentenceRewrites.forEach((r: any, i: number) => {
      lines.push(`  [${i + 1}] ORIGINAL:  ${r.original}`);
      lines.push(`      IMPROVED:  ${r.improved}`);
      lines.push('');
    });
  }

  // Callback improvement
  if (result.callbackImprovement) {
    lines.push('CALLBACK TIP');
    lines.push('───────────────────────');
    lines.push(`  ${result.callbackImprovement}`);
    lines.push('');
  }

  // Text results (non-structured)
  if (typeof result === 'string') {
    lines.push('RESULT');
    lines.push('───────────────────────');
    lines.push(result);
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('  Powered by ATSBeaters AI · atsbeaters.com');
  lines.push('  Questions? support@atsbeaters.com');
  lines.push('═══════════════════════════════════════════════════════════');

  const reportText = lines.join('\n');
  const filename = `ATSBeaters_${label.replace(/\s+/g, '_')}_Report_${Date.now()}.txt`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', Buffer.byteLength(reportText, 'utf8'));

  return res.status(200).send(reportText);
}
