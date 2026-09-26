import { connectToDatabase } from './lib/mongodb.js';
import Store from './models/Store.js';

// CORS headers — required for browser requests from Vercel frontend
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(headers).end();
  }

  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    await connectToDatabase();

    // GET /api/stores — Fetch all stores for SuperAdmin hub
    if (req.method === 'GET') {
      const stores = await Store.find({}).sort({ registeredAt: -1 }).lean();
      return res.status(200).json({ success: true, stores });
    }

    // POST /api/stores — Register or update a store (from shopkeeper PC)
    if (req.method === 'POST') {
      const storeData = req.body;

      if (!storeData || !storeData.storeId || !storeData.storeName) {
        return res.status(400).json({ success: false, message: 'storeId and storeName are required' });
      }

      // Upsert: agar same storeId pehle se hai to update karo, nahi to create karo
      const store = await Store.findOneAndUpdate(
        { storeId: storeData.storeId },
        { ...storeData, lastSeenAt: new Date().toISOString() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({ success: true, store });
    }

    // PUT /api/stores — SuperAdmin Approval & Feature Permissions Update
    if (req.method === 'PUT') {
      const { storeId, subscriptionStatus, subscriptionPlan, featurePermissions, featureRequests } = req.body;
      if (!storeId) {
        return res.status(400).json({ success: false, message: 'storeId is required' });
      }

      const updatePayload = {};
      if (subscriptionStatus) updatePayload.subscriptionStatus = subscriptionStatus;
      if (subscriptionPlan) updatePayload.subscriptionPlan = subscriptionPlan;
      if (featurePermissions !== undefined) updatePayload.featurePermissions = featurePermissions;
      if (featureRequests !== undefined) updatePayload.featureRequests = featureRequests;

      const store = await Store.findOneAndUpdate(
        { storeId },
        { $set: updatePayload },
        { new: true }
      );

      return res.status(200).json({ success: true, store });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (err) {
    console.error('[/api/stores] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}
