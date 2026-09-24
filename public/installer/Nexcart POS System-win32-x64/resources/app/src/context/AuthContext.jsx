import React, { createContext, useContext, useState, useEffect } from 'react';
import { DB } from '../services/db.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [globalHub, setGlobalHub] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DB.init();
    const activeUser = DB.getActiveUser();
    const currentStore = DB.getStore();
    const hub = DB.getGlobalHub();

    setUser(activeUser);
    setStore(currentStore);
    setGlobalHub(hub);
    setLoading(false);
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
    setGlobalHub(DB.getGlobalHub());
    return newStore;
  };

  // Update Store Config / Preset
  const updateStoreConfig = (fields) => {
    const updated = DB.updateStore(fields);
    setStore(updated);
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
      refetchGlobalHub: () => setGlobalHub(DB.getGlobalHub())
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
