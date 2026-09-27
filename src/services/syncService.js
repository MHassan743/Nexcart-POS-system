// Nexcart POS Background Sync Service with Exponential Backoff
import { DB } from './db.js';
import { registerStoreToCloud, syncOutboxToCloud } from './cloudSync.js';

class BackgroundSyncService {
  constructor() {
    this.isSyncing = false;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.retryAttempt = 0;
    this.syncIntervalId = null;
    this.listeners = new Set();
    this.lastSyncedAt = null;
    this.lastError = null;

    // Listen to browser network connectivity events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  // Register listener for sync status updates (used by UI indicator)
  subscribe(listener) {
    this.listeners.add(listener);
    // Send immediate initial status
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(fn => {
      try {
        fn(status);
      } catch (err) {
        console.error('[SyncService] Listener error:', err);
      }
    });
  }

  // Get current sync status summary
  getStatus() {
    const pendingOutbox = DB.getPendingOutbox();
    const currentStore = DB.getStore();
    const isStorePending = Boolean(currentStore && currentStore.pending_sync);
    const totalPendingCount = pendingOutbox.length + (isStorePending ? 1 : 0);

    return {
      isSyncing: this.isSyncing,
      isOnline: this.isOnline,
      pendingCount: totalPendingCount,
      isStorePending,
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
      retryAttempt: this.retryAttempt
    };
  }

  handleNetworkChange(onlineState) {
    this.isOnline = onlineState;
    this.notifyListeners();
    if (onlineState) {
      console.log('[SyncService] Network restored. Triggering immediate cloud sync...');
      this.retryAttempt = 0;
      this.triggerSync();
    }
  }

  // Start periodic background service (every 2-5 minutes)
  start(intervalMs = 120000) { // Default 2 minutes (120,000 ms)
    if (this.syncIntervalId) return;
    
    // Initial sync run
    this.triggerSync();

    // Periodic loop every 2 minutes
    this.syncIntervalId = setInterval(() => {
      this.triggerSync();
    }, intervalMs);
  }

  stop() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  // Main Background Sync Execution Engine
  async triggerSync() {
    if (this.isSyncing) return;

    const currentStore = DB.getStore();
    if (!currentStore || !currentStore.storeId) return;

    this.isSyncing = true;
    this.notifyListeners();

    try {
      let syncSuccess = true;

      // 1. Check & Sync Store Registration / Store Profile if pending_sync = true
      if (currentStore.pending_sync) {
        console.log('[SyncService] Pushing pending store registration to cloud API...');
        const res = await registerStoreToCloud(currentStore);
        if (res.success) {
          const updatedStore = DB.updateStore({
            storeId: res.store_id || res.storeId || currentStore.storeId,
            pending_sync: false
          });
          console.log('[SyncService] Store successfully synced to cloud. Store ID:', updatedStore.storeId);
        } else {
          syncSuccess = false;
        }
      }

      // 2. Check & Push Outbox Queue Items (Sales transactions, stock changes)
      const pendingItems = DB.getPendingOutbox();
      if (pendingItems.length > 0) {
        console.log(`[SyncService] Pushing ${pendingItems.length} outbox queue items to cloud API...`);
        const syncRes = await syncOutboxToCloud(currentStore.storeId, pendingItems);
        
        if (syncRes && syncRes.success) {
          if (Array.isArray(syncRes.syncedIds) && syncRes.syncedIds.length > 0) {
            DB.markOutboxSynced(syncRes.syncedIds);
            console.log(`[SyncService] Successfully synced ${syncRes.syncedIds.length} outbox items to cloud.`);
          }
        } else {
          syncSuccess = false;
        }
      }

      if (syncSuccess) {
        this.retryAttempt = 0;
        this.lastSyncedAt = new Date().toISOString();
        this.lastError = null;
        this.isOnline = true;
      } else {
        this.handleSyncFailure('API response indicated failure');
      }

    } catch (err) {
      console.warn('[SyncService] Sync attempt failed:', err.message);
      this.handleSyncFailure(err.message);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  // Exponential backoff retry logic for failed sync attempts
  handleSyncFailure(errorMessage) {
    this.retryAttempt += 1;
    this.lastError = errorMessage;

    // Calculate exponential backoff delay: 2s, 4s, 8s, 16s... up to max 60s
    const backoffDelay = Math.min(60000, Math.pow(2, this.retryAttempt) * 1000);
    console.log(`[SyncService] Sync retry #${this.retryAttempt} scheduled in ${backoffDelay / 1000}s`);

    setTimeout(() => {
      if (this.isOnline) {
        this.triggerSync();
      }
    }, backoffDelay);
  }
}

// Export singleton instance
export const syncService = new BackgroundSyncService();
