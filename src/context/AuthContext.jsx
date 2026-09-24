import React, { createContext, useContext, useState, useEffect } from 'react';
import { DB } from '../services/db.js';
import { syncStoreToCloud, pingStoreOnline, fetchCloudHub } from '../services/cloudSync.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [globalHub, setGlobalHub] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to sync local stores & MongoDB stores into unified globalHub
  const refreshGlobalHub = async () => {
    const localHub = DB.getGlobalHub();
    const cloudStores = await fetchCloudHub();

    if (cloudStores && cloudStores.length > 0) {
      // Merge cloudStores with localStores (preferring cloud data for duplicates)
      const storeMap = new Map();
      localHub.forEach(s => storeMap.set(s.storeId, s));
      cloudStores.forEach(s => storeMap.set(s.storeId, s));
      setGlobalHub(Array.from(storeMap.values()));
    } else {
      setGlobalHub(localHub);
    }
  };

  useEffect(() => {
    DB.init();
    const activeUser = DB.getActiveUser();
    const currentStore = DB.getStore();

    setUser(activeUser);
    setStore(currentStore);
    setLoading(false);

    // Initial hub load
    refreshGlobalHub();
  }, []);

  // Quick Till PIN Login
  const loginWithPin = (pin) => {
    const foundUser = DB.verifyPin(pin);
    if (foundUser) {
      setUser(foundUser);
      DB.setActiveUser(foundUser);
      DB.addAuditLog({
        employeeId: foundUser.id,
        employeeName: foundUser.name,
        role: foundUser.role,
        action: 'PIN_LOGIN_SUCCESS',
        details: `Employee ${foundUser.name} (${foundUser.role}) signed into Till.`
      });
      const currentStore = DB.getStore();
      if (currentStore?.storeId) {
        pingStoreOnline(currentStore.storeId);
      }
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Invalid 4-digit PIN code' };
  };

  // Admin Email Login
  const loginWithEmail = (email, password) => {
    const employees = DB.getEmployees();
    const found = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      DB.setActiveUser(found);
      DB.addAuditLog({
        employeeId: found.id,
        employeeName: found.name,
        role: found.role,
        action: 'EMAIL_LOGIN_SUCCESS',
        details: `Logged in via email/password as ${found.role}`
      });
      const currentStore = DB.getStore();
      if (currentStore?.storeId) {
        pingStoreOnline(currentStore.storeId);
        // Also ensure current store is synced to cloud
        syncStoreToCloud(currentStore);
      }
      return { success: true, user: found };
    }
    return { success: false, message: 'Account not found for this store' };
  };

  // Register New Store (Serverless Cloud Onboarding)
  const registerStore = (storeData) => {
    const newStore = DB.registerNewStore(storeData);
    const employees = DB.getEmployees();
    const owner = employees.find(e => e.role === 'OWNER') || employees[0];

    setStore(newStore);
    setUser(owner);
    DB.setActiveUser(owner);

    // Immediate Cloud Sync to MongoDB Atlas
    syncStoreToCloud(newStore).then(() => {
      refreshGlobalHub();
    });

    setGlobalHub(DB.getGlobalHub());
    return newStore;
  };

  // Update Store Config / Preset
  const updateStoreConfig = (fields) => {
    const updated = DB.updateStore(fields);
    setStore(updated);

    // Sync updated store config to MongoDB Atlas
    syncStoreToCloud(updated).then(() => {
      refreshGlobalHub();
    });

    setGlobalHub(DB.getGlobalHub());
    return updated;
  };

  // Logout
  const logout = () => {
    DB.logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      store,
      globalHub,
      loading,
      loginWithPin,
      loginWithEmail,
      registerStore,
      updateStoreConfig,
      logout,
      refetchGlobalHub: refreshGlobalHub
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
