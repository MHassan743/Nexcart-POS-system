import { connectToDatabase } from './lib/mongodb.js';
import Store from './models/Store.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(headers).end();
  }

  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { storeId } = req.body;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'storeId required' });
    }

    // Update last seen timestamp when shopkeeper logs in
    await Store.findOneAndUpdate(
      { storeId },
      { lastSeenAt: new Date().toISOString() },
      { new: true }
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[/api/store-ping] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
