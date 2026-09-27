import { connectToDatabase } from './lib/mongodb.js';
import Store from './models/Store.js';

// CORS headers — required for browser & Electron requests
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * POST /api/register-store
 * Dedicated store registration endpoint used by both PWA and .exe clients.
 * Expects storeData in request body.
 * Upserts store record into MongoDB and returns store_id.
 */
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

    const storeData = req.body;
    if (!storeData || (!storeData.storeId && !storeData.store_id) || !storeData.storeName) {
      return res.status(400).json({ success: false, message: 'storeId (or store_id) and storeName are required' });
    }

    const storeId = storeData.storeId || storeData.store_id;

    // Remove any client-side pending_sync flag before saving to cloud
    const { pending_sync, ...cloudStorePayload } = storeData;

    // Upsert store in MongoDB Atlas
    const store = await Store.findOneAndUpdate(
      { storeId },
      { 
        ...cloudStorePayload, 
        storeId, 
        lastSeenAt: new Date().toISOString() 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      store_id: store.storeId,
      storeId: store.storeId,
      message: 'Store registered successfully on Nexcart Cloud Hub',
      store
    });

  } catch (err) {
    console.error('[/api/register-store] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}
