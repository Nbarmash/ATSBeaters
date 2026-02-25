import type { VercelRequest, VercelResponse } from '@vercel/node';

// Phase 2: Send analysis report email via SendGrid
// Uses SENDGRID_API_KEY environment variable (already set in Vercel)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, serviceType, result } = req.body;

  if (!email || !result) {
    return res.status(400).json({ error: 'Missing required fields: email, result' });
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  if (!SENDGRID_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // Build branded email HTML
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

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: Arial, sans-serif; background:#f8fafc; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:24px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:#6366f1; padding:32px; text-align:center;">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">👻</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:-1px;">ATSBEATERS</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;font-weight:600;">${serviceLabel[serviceType] || 'Analysis'} Complete</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#475569;font-size:16px;margin-top:0;">Hi ${name || 'there'},</p>
      <p style="color:#475569;font-size:16px;">Your <strong>${serviceLabel[serviceType] || 'analysis'}</strong> has been processed. Here's your full report:</p>

      ${score != null ? `
      <!-- Score Card -->
      <div style="background:#f8fafc;border-radius:16px;padding:24px;text-align:center;margin:24px 0;border:2px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">ATS Score</p>
        <p style="color:${scoreColor};font-size:56px;font-weight:900;margin:0;line-height:1;">${score}%</p>
        <span style="display:inline-block;background:${scoreColor};color:#fff;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-top:8px;">${scoreLabel}</span>
      </div>
      ` : ''}

      ${strengthsList ? `
      <!-- Strengths -->
      <div style="margin:24px 0;">
        <h3 style="color:#10b981;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">✅ What's Working</h3>
        <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">
          ${strengthsList}
        </ul>
      </div>
      ` : ''}

      ${weaknessesList ? `
      <!-- Weaknesses -->
      <div style="margin:24px 0;">
        <h3 style="color:#f59e0b;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">⚠️ Areas to Improve</h3>
        <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;">
          ${weaknessesList}
        </ul>
      </div>
      ` : ''}

      ${keywordsList ? `
      <!-- Missing Keywords -->
      <div style="margin:24px 0;">
        <h3 style="color:#6366f1;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">🎯 Missing Keywords</h3>
        <div>${keywordsList}</div>
      </div>
      ` : ''}

      ${result.callbackImprovement ? `
      <!-- Pro Tip -->
      <div style="background:#EEF2FF;border-radius:16px;padding:20px;margin:24px 0;border-left:4px solid #6366f1;">
        <p style="color:#6366f1;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">💡 Pro Tip</p>
        <p style="color:#475569;font-size:14px;margin:0;line-height:1.6;">${result.callbackImprovement}</p>
      </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0 16px;">
        <a href="https://atsbeaters.com" style="display:inline-block;background:#6366f1;color:#fff;padding:16px 40px;border-radius:16px;font-size:16px;font-weight:900;text-decoration:none;letter-spacing:-0.5px;">
          Return to ATSBeaters →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">ATSBeaters AI © 2026 · Trusted by 20,000+ professionals</p>
      <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;">
        <a href="https://atsbeaters.com" style="color:#6366f1;text-decoration:none;">atsbeaters.com</a> · 
        <a href="mailto:support@atsbeaters.com" style="color:#6366f1;text-decoration:none;">support@atsbeaters.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  // Send via SendGrid REST API
  try {
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email, name: name || 'User' }] }],
        from: { email: 'noahbarmash23@gmail.com', name: 'ATSBeaters' },
        reply_to: { email: 'support@atsbeaters.com' },
        subject: score != null
          ? `ATSBeaters: Your Resume Score is ${score}% (${scoreLabel})`
          : `ATSBeaters: Your ${serviceLabel[serviceType] || 'Analysis'} Report`,
        content: [{ type: 'text/html', value: htmlContent }],
      }),
    });

    if (sgResponse.ok || sgResponse.status === 202) {
      return res.status(200).json({ success: true, message: 'Report sent successfully' });
    } else {
      const errorText = await sgResponse.text();
      console.error('SendGrid error:', errorText);
      return res.status(500).json({ error: 'Failed to send email', details: errorText });
    }
  } catch (err: any) {
    console.error('Email error:', err);
    return res.status(500).json({ error: 'Email service error', details: err.message });
  }
}
