import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey, productId } = req.body;

  if (!licenseKey) {
    return res.status(400).json({ error: 'License key is required' });
  }

  try {
    // Gumroad license verification API
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
    
    // Determine tier based on product
    let tier: 'pro' | 'package' = 'pro';
    let credits = 999;
    if (productName.toLowerCase().includes('package') || productName.toLowerCase().includes('bundle')) {
      tier = 'package';
      credits = 9999;
    }

    return res.status(200).json({
      success: true,
      tier,
      credits,
      email: purchase?.email || '',
      productName,
    });
  } catch (err: any) {
    console.error('License verify error:', err);
    return res.status(500).json({ error: 'Failed to verify license key' });
  }
}
