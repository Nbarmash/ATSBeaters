import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase admin client (service-role key, server-side only) ─────────────
// SUPABASE_SERVICE_ROLE_KEY must be set in Vercel environment variables.
// It is NEVER exposed to the browser — this file only runs in Node.js.
function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase env vars on server (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey, productId, userId } = req.body;

  if (!licenseKey) {
    return res.status(400).json({ error: 'License key is required' });
  }

  try {
    // ── Step 1: Verify the license against Gumroad ─────────────────────────
    const gumroadRes = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_id: productId || '',
        license_key: licenseKey.trim(),
        increment_uses_count: 'false',
      }).toString(),
    });

    const data = await gumroadRes.json();

    if (!data.success) {
      return res.status(400).json({ error: 'Invalid or already used license key', details: data.message });
    }

    const purchase = data.purchase;
    const productName = purchase?.product_name || '';

    // ── Step 2: Determine tier and credits from product name ────────────────
    let tier: 'pro' | 'package' = 'pro';
    let credits = 999;
    if (productName.toLowerCase().includes('package') || productName.toLowerCase().includes('bundle')) {
      tier = 'package';
      credits = 9999;
    }

    const purchaserEmail = purchase?.email || '';

    // ── Step 3: Persist upgrade to Supabase profiles table ─────────────────
    // We update by email because the client may not always pass userId.
    // If userId is supplied, prefer that (faster, avoids email lookup).
    if (userId || purchaserEmail) {
      try {
        const admin = getAdminClient();

        if (userId) {
          // Direct update by UUID
          await admin
            .from('profiles')
            .update({ tier, credits })
            .eq('id', userId);
        } else {
          // Look up auth user by email, then update profiles
          const { data: { users } } = await admin.auth.admin.listUsers();
          const matchedUser = users.find((u: any) => u.email === purchaserEmail);
          if (matchedUser) {
            await admin
              .from('profiles')
              .update({ tier, credits })
              .eq('id', matchedUser.id);
          }
        }
      } catch (supabaseErr: any) {
        // Log but don't fail — the client-side upgradeTier() will also write to Supabase
        console.error('[verify-license] Supabase update error:', supabaseErr.message);
      }
    }

    // ── Step 4: Return success payload to client ────────────────────────────
    return res.status(200).json({
      success: true,
      tier,
      credits,
      email: purchaserEmail,
    });
  } catch (err) {
    console.error('[verify-license] Unexpected error:', err);
    return res.status(500).json({ error: 'Failed to verify. Please check your connection.' });
  }
}
