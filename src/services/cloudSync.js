// Nexcart Cloud Sync Service — MongoDB Atlas API Bridge
// Yeh service shopkeeper PC se Vercel API ke zariye MongoDB mein data sync karta hai

// Hardcoded Vercel production URL — .exe app ke liye zaroori hai kyunki
// Electron mein VITE env variables inject nahi hotay
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://nexcart-pos-system.vercel.app';

/**
 * Naye store ko MongoDB Atlas mein register/sync karo
 * Jab bhi koi shopkeeper "Register Store on Nexcart Cloud" karta hai, yeh call hoti hai
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
    // Network error — silently fail, local data still works
    console.warn('[CloudSync] syncStoreToCloud network error:', err.message);
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
 * SuperAdmin se store subscription status approve/reject/block karo
 */
export async function approveStoreSubscription(storeId, subscriptionStatus, subscriptionPlan) {
  try {
    const res = await fetch(`${API_BASE}/api/stores`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, subscriptionStatus, subscriptionPlan })
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('[CloudSync] approveStoreSubscription error:', err.message);
    return { success: false, error: err.message };
  }
}
