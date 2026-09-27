import { connectToDatabase } from './lib/mongodb.js';
import Store from './models/Store.js';
import Transaction from './models/Transaction.js';
import Product from './models/Product.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * POST /api/sync
 * Endpoint for offline outbox synchronization.
 * Accepts array of outbox events / payloads (sales, stock changes, store updates).
 * Persists updates to MongoDB models and updates Super Admin metrics.
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

    const { storeId, items } = req.body;

    if (!storeId || !Array.isArray(items)) {
      return res.status(400).json({ 
        success: false, 
        message: 'storeId and items array are required' 
      });
    }

    const syncedIds = [];
    let salesCountDelta = 0;
    let salesVolumeDelta = 0;

    for (const item of items) {
      const { id, type, payload, timestamp } = item;
      if (!id || !type) continue;

      try {
        if (type === 'STORE_UPDATE' || type === 'STORE_REGISTER') {
          const { pending_sync, ...storePayload } = payload || {};
          await Store.findOneAndUpdate(
            { storeId: storePayload.storeId || storeId },
            { ...storePayload, storeId: storePayload.storeId || storeId, lastSeenAt: new Date().toISOString() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          syncedIds.push(id);
        } else if (type === 'TRANSACTION_CREATE') {
          if (payload && payload.id) {
            await Transaction.findOneAndUpdate(
              { id: payload.id },
              { ...payload, storeId: payload.storeId || storeId },
              { upsert: true, new: true }
            );
            salesCountDelta += 1;
            salesVolumeDelta += (payload.grandTotal || 0);
          }
          syncedIds.push(id);
        } else if (type === 'PRODUCT_UPDATE') {
          if (payload && payload.id) {
            await Product.findOneAndUpdate(
              { id: payload.id },
              { ...payload, storeId: payload.storeId || storeId },
              { upsert: true, new: true }
            );
          }
          syncedIds.push(id);
        } else if (type === 'CUSTOMER_UPDATE') {
          // Customer khaata update handled within store or audit
          syncedIds.push(id);
        } else {
          // Unknown item type, mark as processed to prevent block
          syncedIds.push(id);
        }
      } catch (itemErr) {
        console.warn(`[api/sync] Failed to sync item ${id} (${type}):`, itemErr.message);
      }
    }

    // Update Store aggregate metrics if sales transactions were synced
    if (salesCountDelta > 0 || salesVolumeDelta > 0) {
      await Store.findOneAndUpdate(
        { storeId },
        {
          $inc: {
            totalTransactionsCount: salesCountDelta,
            totalSalesVolume: salesVolumeDelta
          },
          lastSeenAt: new Date().toISOString()
        }
      );
    }

    return res.status(200).json({
      success: true,
      storeId,
      syncedIds,
      countSynced: syncedIds.length,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[/api/sync] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}
