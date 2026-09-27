// Nexcart Cloud Sync Service — MongoDB Atlas API Bridge
// Yeh service shopkeeper PC se Vercel API ke zariye MongoDB mein data sync karta hai

// Hardcoded Vercel production URL — .exe app ke liye zaroori hai kyunki
// Electron mein VITE env variables inject nahi hotay
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://nexcart-pos-system.vercel.app';

/**
 * Naye store ko MongoDB Atlas mein register/sync karo
 * Dedicated /api/register-store endpoint caller
 * Returns { success, store_id, store, error }
 */
export async function registerStoreToCloud(storeData) {
  try {
    const res = await fetch(`${API_BASE}/api/register-store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeData),
    });
    const json = await res.json();
    if (!json.success) {
      console.warn('[CloudSync] registerStoreToCloud failed:', json.message);
    }
    return json;
  } catch (err) {
    console.warn('[CloudSync] registerStoreToCloud network error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Naye store ko MongoDB Atlas mein register/sync karo (legacy fallback endpoint /api/stores)
 */
export async function syncStoreToCloud(storeData) {
  try {
    const res = await fetch(`${API_BASE}/api/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeData),
    });
    const json = await res.json();
    if (!json.success) {
      console.warn('[CloudSync] Store register failed:', json.message);
    }
    return json;
  } catch (err) {
    console.warn('[CloudSync] syncStoreToCloud network error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Offline Outbox Queue data (sales, stock changes, customer updates) ko MongoDB Atlas Cloud API pe push karo
 */
export async function syncOutboxToCloud(storeId, items) {
  if (!storeId || !Array.isArray(items) || items.length === 0) {
    return { success: true, countSynced: 0, syncedIds: [] };
  }
  try {
    const res = await fetch(`${API_BASE}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, items }),
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('[CloudSync] syncOutboxToCloud error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Login ke waqt MongoDB mein lastSeenAt update karo
 */
export async function pingStoreOnline(storeId) {
  if (!storeId) return;
  try {
    await fetch(`${API_BASE}/api/store-ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId }),
    });
  } catch (err) {
    console.warn('[CloudSync] pingStoreOnline error:', err.message);
  }
}

/**
 * SuperAdmin ke liye MongoDB se sare registered stores fetch karo
 */
export async function fetchCloudHub() {
  try {
    const res = await fetch(`${API_BASE}/api/stores`);
    const json = await res.json();
    if (json.success) {
      return json.stores || [];
    }
    return [];
  } catch (err) {
    console.warn('[CloudSync] fetchCloudHub error:', err.message);
    return [];
  }
}

/**
 * SuperAdmin se store subscription status approve/reject/block karo & feature permissions update karo
 */
export async function approveStoreSubscription(storeId, subscriptionStatus, subscriptionPlan, featurePermissions, featureRequests) {
  try {
    const res = await fetch(`${API_BASE}/api/stores`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, subscriptionStatus, subscriptionPlan, featurePermissions, featureRequests })
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('[CloudSync] approveStoreSubscription error:', err.message);
    return { success: false, error: err.message };
  }
}
