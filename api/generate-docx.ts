import type { VercelRequest, VercelResponse } from '@vercel/node';

const serviceLabel: Record<string, string> = {
  analyzer: 'Resume Analysis', rewrite: 'Full Rewrite', quick_rewrite: 'Quick Optimize',
  cover_letter: 'Cover Letter', keywords: 'Market Keywords', ats_check: 'ATS Health Check',
  quantifier: 'Metrics Builder', summary: 'Summary Generator', skills: 'Skills Studio',
};

function esc(str: string): string {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildLines(result: any, label: string): string[] {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const lines: string[] = [];
  lines.push('ATSBEATERS - ' + label.toUpperCase() + ' REPORT');
  lines.push('Generated: ' + now + ' | atsbeaters.com');
  lines.push('');
  if (result.score != null) {
    const lbl = result.score >= 80 ? 'EXCELLENT' : result.score >= 60 ? 'NEEDS WORK' : 'AT RISK';
    lines.push('ATS SCORE: ' + result.score + '% [' + lbl + ']');
    if (result.suggestedJobField) lines.push('Target Field: ' + result.suggestedJobField);
    lines.push('');
  }
  if (result.strengths?.length) { lines.push("WHAT'S WORKING:"); result.strengths.forEach((s: string) => lines.push('  - ' + s)); lines.push(''); }
  if (result.weaknesses?.length) { lines.push('AREAS TO IMPROVE:'); result.weaknesses.forEach((w: string) => lines.push('  - ' + w)); lines.push(''); }
  if (result.missingKeywords?.length) { lines.push('MISSING KEYWORDS: ' + result.missingKeywords.join(', ')); lines.push(''); }
  if (result.hardSkills?.length) { lines.push('HARD SKILLS: ' + result.hardSkills.join(', ')); lines.push(''); }
  if (result.softSkills?.length) { lines.push('SOFT SKILLS: ' + result.softSkills.join(', ')); lines.push(''); }
  if (result.callbackImprovement) { lines.push('PRO TIP: ' + result.callbackImprovement); lines.push(''); }
  if (Array.isArray(result)) { result.forEach((item: any, i: number) => { lines.push('OPTION ' + (i + 1) + ':'); lines.push(String(item)); lines.push(''); }); }
  else if (typeof result === 'string') { lines.push('RESULT:'); lines.push(result); lines.push(''); }
  lines.push('Powered by ATSBeaters AI | atsbeaters.com | support@atsbeaters.com');
  return lines;
}

function buildHtml(result: any, label: string): string {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const sec = (title: string, color: string, body: string) => '<div style="margin:20px 0"><h3 style="color:' + color + ';font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;border-bottom:2px solid ' + color + '33;padding-bottom:5px">' + title + '</h3>' + body + '</div>';
  const pill = (t: string, bg: string, c: string) => '<span style="display:inline-block;background:' + bg + ';color:' + c + ';padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;margin:3px">' + esc(t) + '</span>';
  const pre = (t: string) => '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;white-space:pre-wrap;font-family:Courier New,monospace;font-size:12px;color:#334155;line-height:1.7">' + esc(String(t)) + '</div>';
  let body = '';
  if (result.score != null) {
    const sc = result.score >= 80 ? '#10b981' : result.score >= 60 ? '#6366f1' : '#f59e0b';
    const sl = result.score >= 80 ? 'EXCELLENT' : result.score >= 60 ? 'NEEDS WORK' : 'AT RISK';
    body += '<div style="text-align:center;background:#f8fafc;border-radius:16px;padding:24px;margin:24px 0;border:2px solid #e2e8f0"><p style="color:#94a3b8;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">ATS SCORE</p><p style="color:' + sc + ';font-size:52px;font-weight:900;margin:0;line-height:1">' + result.score + '%</p><span style="display:inline-block;background:' + sc + ';color:#fff;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-top:8px">' + sl + '</span>' + (result.suggestedJobField ? '<p style="color:#64748b;font-size:13px;margin:12px 0 0">Target: <strong>' + esc(result.suggestedJobField) + '</strong></p>' : '') + '</div>';
  }
  if (result.strengths?.length) body += sec("What's Working", '#10b981', '<ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8">' + result.strengths.map((s: string) => '<li>' + esc(s) + '</li>').join('') + '</ul>');
  if (result.weaknesses?.length) body += sec('Areas to Improve', '#f59e0b', '<ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8">' + result.weaknesses.map((w: string) => '<li>' + esc(w) + '</li>').join('') + '</ul>');
  if (result.missingKeywords?.length) body += sec('Missing Keywords', '#6366f1', result.missingKeywords.map((k: string) => pill(k, '#EEF2FF', '#6366f1')).join(''));
  if (result.hardSkills?.length) body += sec('Hard Skills', '#6366f1', result.hardSkills.map((k: string) => pill(k, '#EEF2FF', '#6366f1')).join(''));
  if (result.softSkills?.length) body += sec('Soft Skills', '#10b981', result.softSkills.map((k: string) => pill(k, '#F0FDF4', '#10b981')).join(''));
  if (result.callbackImprovement) body += sec('Pro Tip', '#6366f1', '<p style="color:#475569;font-size:14px;line-height:1.7;margin:0">' + esc(result.callbackImprovement) + '</p>');
  if (Array.isArray(result)) result.forEach((item: any, i: number) => { body += sec('Option ' + (i + 1), '#6366f1', pre(item)); });
  else if (typeof result === 'string') body += sec('Result', '#6366f1', pre(result));
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>ATSBeaters ' + esc(label) + '</title><style>@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}body{font-family:Arial,sans-serif;margin:0 auto;padding:40px;max-width:800px}</style></head><body><div style="background:#6366f1;padding:28px 32px;border-radius:16px;margin-bottom:32px;text-align:center"><h1 style="color:#fff;margin:0;font-size:26px;font-weight:900">ATSBEATERS</h1><p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;font-weight:600">' + esc(label) + ' Report - ' + esc(now) + '</p></div>' + body + '<div style="border-top:1px solid #e2e8f0;margin-top:40px;padding-top:20px;text-align:center;color:#94a3b8;font-size:11px">Powered by ATSBeaters AI - atsbeaters.com</div></body></html>';
}

function buildDocx(result: any, label: string): string {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const p = (text: string, bold = false, sz = 24, col = '1e293b') => '<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr>' + (bold ? '<w:b/>' : '') + '<w:sz w:val="' + sz + '"/><w:color w:val="' + col + '"/></w:rPr><w:t xml:space="preserve">' + esc(text) + '</w:t></w:r></w:p>';
  const h = (text: string) => '<w:p><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="6366f1"/></w:rPr><w:t>' + esc(text) + '</w:t></w:r></w:p>';
  const div = () => '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="e2e8f0"/></w:pBdr></w:pPr></w:p>';
  let body = '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="6366f1"/></w:rPr><w:t>ATSBEATERS</w:t></w:r></w:p>';
  body += '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/><w:color w:val="64748b"/></w:rPr><w:t>' + esc(label + ' Report - ' + now) + '</w:t></w:r></w:p>' + div();
  if (result.score != null) { const sl = result.score >= 80 ? 'EXCELLENT' : result.score >= 60 ? 'NEEDS WORK' : 'AT RISK'; body += h('ATS SCORE') + p('Score: ' + result.score + '% [' + sl + ']', true, 28, result.score >= 80 ? '10b981' : result.score >= 60 ? '6366f1' : 'f59e0b'); if (result.suggestedJobField) body += p('Target Field: ' + result.suggestedJobField); body += div(); }
  if (result.strengths?.length) { body += h("WHAT'S WORKING"); result.strengths.forEach((s: string) => { body += p('- ' + s); }); body += div(); }
  if (result.weaknesses?.length) { body += h('AREAS TO IMPROVE'); result.weaknesses.forEach((w: string) => { body += p('- ' + w); }); body += div(); }
  if (result.missingKeywords?.length) { body += h('MISSING KEYWORDS') + p(result.missingKeywords.join(', ')) + div(); }
  if (result.hardSkills?.length) { body += h('HARD SKILLS') + p(result.hardSkills.join(', ')) + div(); }
  if (result.softSkills?.length) { body += h('SOFT SKILLS') + p(result.softSkills.join(', ')) + div(); }
  if (result.callbackImprovement) { body += h('PRO TIP') + p(result.callbackImprovement) + div(); }
  if (Array.isArray(result)) { result.forEach((item: any, i: number) => { body += h('OPTION ' + (i + 1)) + p(String(item)) + div(); }); }
  else if (typeof result === 'string') { body += h('RESULT'); String(result).split('\\n').forEach((line: string) => { body += p(line || ' '); }); body += div(); }
  body += p('Powered by ATSBeaters AI | atsbeaters.com', false, 18, '94a3b8');
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body + '<w:sectPr><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { result, serviceType, format = 'txt' } = req.body;
  if (!result) return res.status(400).json({ error: 'Missing result data' });
  const label = serviceLabel[serviceType] || 'Analysis';
  const safeName = label.replace(/\\s+/g, '_');
  const ts = Date.now();
  if (format === 'pdf') {
    const html = buildHtml(result, label);
    const filename = 'ATSBeaters_' + safeName + '_' + ts + '.html';
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    return res.status(200).send(html);
  }
  if (format === 'docx') {
    const xml = buildDocx(result, label);
    const filename = 'ATSBeaters_' + safeName + '_' + ts + '.docx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    return res.status(200).send(xml);
  }
  const lines = buildLines(result, label);
  const txt = lines.join('\\n');
  const filename = 'ATSBeaters_' + safeName + '_Report_' + ts + '.txt';
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
  return res.status(200).send(txt);
    }
