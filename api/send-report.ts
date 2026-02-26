import type { VercelRequest, VercelResponse } from '@vercel/node';

// Phase 2: Send analysis report email via Resend
// Uses RESEND_API_KEY environment variable (set in Vercel)
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

  const score = result.score;
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : '#f59e0b';
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Needs Work' : 'At Risk';

  const strengthsList = (result.strengths || [])
    .slice(0, 3)
    .map((s: string) => `<li style="margin-bottom:8px;">${s}</li>`)
    .join('');

  const weaknessesList = (result.weaknesses || [])
    .slice(0, 3)
    .map((w: string) => `<li style="margin-bottom:8px;">${w}</li>`)
    .join('');

  const keywordsList = (result.missingKeywords || [])
    .slice(0, 5)
    .map((k: string) => `<span style="display:inline-block;background:#EEF2FF;color:#6366f1;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;margin:3px;">${k}</span>`)
    .join('');

  const serviceLabel: Record<string, string> = {
    analyzer: 'Resume Analysis', rewrite: 'Full Rewrite', quick_rewrite: 'Quick Optimize',
    cover_letter: 'Cover Letter', keywords: 'Market Keywords', ats_check: 'ATS Health',
    quantifier: 'Metrics Builder', summary: 'Summary Generator', skills: 'Skills Studio',
  };

  const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:#6366f1;padding:32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;">👻 ATSBEATERS</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;font-weight:600;">${serviceLabel[serviceType] || 'Analysis'} Complete</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#475569;font-size:16px;margin-top:0;">Hi ${name || 'there'},</p>
    <p style="color:#475569;font-size:16px;">Your <strong>${serviceLabel[serviceType] || 'analysis'}</strong> is ready. Here's your report:</p>
    ${score != null ? `
    <div style="background:#f8fafc;border-radius:16px;padding:24px;text-align:center;margin:24px 0;border:2px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">ATS Score</p>
      <p style="color:${scoreColor};font-size:56px;font-weight:900;margin:0;line-height:1;">${score}%</p>
      <span style="display:inline-block;background:${scoreColor};color:#fff;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-top:8px;">${scoreLabel}</span>
    </div>` : ''}
    ${strengthsList ? `<div style="margin:24px 0;"><h3 style="color:#10b981;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">✅ What's Working</h3><ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">${strengthsList}</ul></div>` : ''}
    ${weaknessesList ? `<div style="margin:24px 0;"><h3 style="color:#f59e0b;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">⚠️ Areas to Improve</h3><ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">${weaknessesList}</ul></div>` : ''}
    ${keywordsList ? `<div style="margin:24px 0;"><h3 style="color:#6366f1;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">🎯 Missing Keywords</h3><div>${keywordsList}</div></div>` : ''}
    ${result.callbackImprovement ? `<div style="background:#EEF2FF;border-radius:16px;padding:20px;margin:24px 0;border-left:4px solid #6366f1;"><p style="color:#6366f1;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">💡 Pro Tip</p><p style="color:#475569;font-size:14px;margin:0;line-height:1.6;">${result.callbackImprovement}</p></div>` : ''}
    <div style="text-align:center;margin:32px 0 16px;">
      <a href="https://atsbeaters.com" style="display:inline-block;background:#6366f1;color:#fff;padding:16px 40px;border-radius:16px;font-size:16px;font-weight:900;text-decoration:none;">Return to ATSBeaters →</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="color:#94a3b8;font-size:12px;margin:0;">ATSBeaters AI © 2026 · <a href="https://atsbeaters.com" style="color:#6366f1;text-decoration:none;">atsbeaters.com</a></p>
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
        from: 'ATSBeaters <onboarding@resend.dev>',
        to: [email],
        reply_to: 'noahbarmash23@gmail.com',
        subject: score != null
          ? `ATSBeaters: Your Resume Score is ${score}% (${scoreLabel})`
          : `ATSBeaters: Your ${serviceLabel[serviceType] || 'Analysis'} Report`,
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
