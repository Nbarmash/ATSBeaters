import type { VercelRequest, VercelResponse } from '@vercel/node';

const serviceLabel: Record<string, string> = {
    analyzer: 'Resume Analysis',
    rewrite: 'Full Rewrite',
    quick_rewrite: 'Quick Optimize',
    cover_letter: 'Cover Letter',
    keywords: 'Market Keywords',
    ats_check: 'ATS Health',
    quantifier: 'Metrics Builder',
    summary: 'Summary Generator',
    skills: 'Skills Studio',
};

function escapeHtml(str: string): string {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
}

function resultToHtml(serviceType: string, result: any): string {
    // Helper: wrap plain text in a pre-formatted block
  const textBlock = (text: string) =>
        `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;white-space:pre-wrap;font-family:monospace;font-size:13px;color:#334155;line-height:1.7;word-break:break-word;">${escapeHtml(String(text))}</div>`;

  const sectionHeader = (title: string, color = '#6366f1') =>
        `<h3 style="color:${color};font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:24px 0 10px;">${title}</h3>`;

  // --- Resume Analysis (structured object) ---
  if (serviceType === 'analyzer' && result && typeof result === 'object') {
        const score = result.score;
        const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : '#f59e0b';
        const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Needs Work' : 'At Risk';
        const strengthsList = (result.strengths || []).slice(0, 5).map((s: string) =>
                `<li style="margin-bottom:8px;">${escapeHtml(s)}</li>`).join('');
        const weaknessesList = (result.weaknesses || []).slice(0, 5).map((w: string) =>
                `<li style="margin-bottom:8px;">${escapeHtml(w)}</li>`).join('');
        const keywordsList = (result.missingKeywords || []).slice(0, 10).map((k: string) =>
                `<span style="display:inline-block;background:#EEF2FF;color:#6366f1;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;margin:3px;">${escapeHtml(k)}</span>`).join('');

      return `
            <div style="background:#f8fafc;border-radius:16px;padding:24px;text-align:center;margin:24px 0;border:2px solid #e2e8f0;">
                    <p style="color:#94a3b8;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">ATS Score</p>
                            <p style="color:${scoreColor};font-size:56px;font-weight:900;margin:0;line-height:1;">${score}%</p>
                                    <span style="display:inline-block;background:${scoreColor};color:#fff;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-top:8px;">${scoreLabel}</span>
                                          </div>
                                                ${strengthsList ? `${sectionHeader('✅ What\'s Working', '#10b981')}<ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">${strengthsList}</ul>` : ''}
                                                      ${weaknessesList ? `${sectionHeader('⚠️ Areas to Improve', '#f59e0b')}<ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">${weaknessesList}</ul>` : ''}
                                                            ${keywordsList ? `${sectionHeader('🎯 Missing Keywords', '#6366f1')}<div>${keywordsList}</div>` : ''}
                                                                  ${result.callbackImprovement ? `<div style="background:#EEF2FF;border-radius:12px;padding:16px;margin:16px 0;border-left:4px solid #6366f1;">${sectionHeader('💡 Pro Tip', '#6366f1')}<p style="color:#475569;font-size:14px;margin:0;">${escapeHtml(result.callbackImprovement)}</p></div>` : ''}
                                                                      `;
  }

  // --- Cover Letter (plain string) ---
  if (serviceType === 'cover_letter') {
        const text = typeof result === 'string' ? result : (result?.coverLetter || result?.letter || JSON.stringify(result, null, 2));
        return `${sectionHeader('📄 Your Cover Letter', '#6366f1')}${textBlock(text)}`;
  }

  // --- Full Rewrite or Quick Optimize (plain string) ---
  if (serviceType === 'rewrite' || serviceType === 'quick_rewrite') {
        const text = typeof result === 'string' ? result : (result?.resume || result?.rewrite || result?.optimizedResume || JSON.stringify(result, null, 2));
        return `${sectionHeader('📝 Your Optimized Resume', '#6366f1')}${textBlock(text)}`;
  }

  // --- Market Keywords (structured object with hardSkills / softSkills) ---
  if (serviceType === 'keywords' && result && typeof result === 'object') {
        const hard = (result.hardSkills || result.keywords || []).map((k: string) =>
                `<span style="display:inline-block;background:#EEF2FF;color:#6366f1;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;margin:3px;">${escapeHtml(k)}</span>`).join('');
        const soft = (result.softSkills || []).map((k: string) =>
                `<span style="display:inline-block;background:#F0FDF4;color:#10b981;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;margin:3px;">${escapeHtml(k)}</span>`).join('');
        return `
              ${hard ? `${sectionHeader('🔧 Hard Skills / Keywords', '#6366f1')}<div>${hard}</div>` : ''}
                    ${soft ? `${sectionHeader('🤝 Soft Skills', '#10b981')}<div>${soft}</div>` : ''}
                          ${(!hard && !soft) ? textBlock(JSON.stringify(result, null, 2)) : ''}
                              `;
  }

  // --- ATS Health Check ---
  if (serviceType === 'ats_check' && result && typeof result === 'object') {
        const parseScore = result.parseScore ?? result.score;
        const scoreColor = parseScore >= 80 ? '#10b981' : parseScore >= 60 ? '#6366f1' : '#f59e0b';
        const issues = (result.issues || result.problems || []).map((i: string) =>
                `<li style="margin-bottom:8px;">${escapeHtml(i)}</li>`).join('');
        const tips = (result.tips || result.suggestions || []).map((t: string) =>
                `<li style="margin-bottom:8px;">${escapeHtml(t)}</li>`).join('');
        return `
              ${parseScore != null ? `<div style="background:#f8fafc;border-radius:16px;padding:24px;text-align:center;margin:24px 0;border:2px solid #e2e8f0;">
                      <p style="color:#94a3b8;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Parse Score</p>
                              <p style="color:${scoreColor};font-size:56px;font-weight:900;margin:0;line-height:1;">${parseScore}%</p>
                                    </div>` : ''}
                                          ${issues ? `${sectionHeader('⚠️ Issues Found', '#f59e0b')}<ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">${issues}</ul>` : ''}
                                                ${tips ? `${sectionHeader('💡 Suggestions', '#6366f1')}<ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">${tips}</ul>` : ''}
                                                    `;
  }

  // --- Metrics Builder / Quantifier ---
  if (serviceType === 'quantifier') {
        const text = typeof result === 'string' ? result : (result?.quantified || result?.bullets || JSON.stringify(result, null, 2));
        return `${sectionHeader('📊 Quantified Achievements', '#6366f1')}${textBlock(text)}`;
  }

  // --- Summary Generator ---
  if (serviceType === 'summary') {
        const summaries = Array.isArray(result) ? result : (result?.summaries || result?.options || null);
        if (summaries && Array.isArray(summaries)) {
                return summaries.map((s: string, i: number) =>
                          `${sectionHeader(`📌 Option ${i + 1}`, '#6366f1')}${textBlock(s)}`
                                           ).join('');
        }
        const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        return `${sectionHeader('📌 Professional Summary', '#6366f1')}${textBlock(text)}`;
  }

  // --- Skills Studio ---
  if (serviceType === 'skills') {
        const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        return `${sectionHeader('🛠️ Optimized Skills Section', '#6366f1')}${textBlock(text)}`;
  }

  // --- Fallback: any other type ---
  const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    return `${sectionHeader('📋 Your Results', '#6366f1')}${textBlock(text)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
    }

  const { email, name, serviceType, result } = req.body;

  if (!email || !result) {
        return res.status(400).json({ error: 'Missing required fields: email, result' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
          return res.status(500).json({ error: 'Email service not configured' });
    }

  const label = serviceLabel[serviceType] || 'Analysis';
    const score = result?.score;
    const scoreLabel = score != null ? (score >= 80 ? 'Excellent' : score >= 60 ? 'Needs Work' : 'At Risk') : null;
    const subject = score != null
      ? `ATSBeaters: Your Resume Score is ${score}% (${scoreLabel})`
          : `ATSBeaters: Your ${label} is Ready`;

  const contentHtml = resultToHtml(serviceType, result);

  const htmlContent = `<!DOCTYPE html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:20px;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:#6366f1;padding:32px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;">👻 ATSBEATERS</h1>
                    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;font-weight:600;">${label} Complete</p>
                        </div>
                            <div style="padding:32px;">
                                  <p style="color:#475569;font-size:16px;margin-top:0;">Hi ${escapeHtml(name || 'there')},</p>
                                        <p style="color:#475569;font-size:16px;">Your <strong>${label}</strong> is ready. Here are your full results:</p>
                                              ${contentHtml}
                                                    <div style="text-align:center;margin:32px 0 16px;">
                                                            <a href="https://www.atsbeaters.com" style="display:inline-block;background:#6366f1;color:#fff;padding:16px 40px;border-radius:16px;font-size:16px;font-weight:900;text-decoration:none;">Return to ATSBeaters →</a>
                                                                  </div>
                                                                      </div>
                                                                          <div style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
                                                                                <p style="color:#94a3b8;font-size:12px;margin:0;">ATSBeaters AI © 2026 · <a href="https://www.atsbeaters.com" style="color:#6366f1;text-decoration:none;">atsbeaters.com</a></p>
                                                                                    </div>
                                                                                      </div>
                                                                                      </body></html>`;

  try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                          'Authorization': `Bearer ${RESEND_API_KEY}`,
                          'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                          from: 'ATSBeaters <support@atsbeaters.com>',
                          to: [email],
                          reply_to: 'noahbarmash23@gmail.com',
                          subject,
                          html: htmlContent,
                }),
        });

      if (resendResponse.ok) {
              return res.status(200).json({ success: true, message: 'Report sent successfully' });
      } else {
              const errorText = await resendResponse.text();
              console.error('Resend error:', errorText);
              return res.status(500).json({ error: 'Failed to send email', details: errorText });
      }
  } catch (err: any) {
        console.error('Email error:', err);
        return res.status(500).json({ error: 'Email service error', details: err.message });
  }
}
