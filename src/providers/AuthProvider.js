// AuthProvider: Manages authentication state (converted from Flutter AuthService)
import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../services/AuthService';
import { PreferenceKeys, PreferencesService } from '../services/preferencesService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [localUser, setLocalUserState] = useState(null);

  const setLocalUser = async (nextUser) => {
    setLocalUserState(nextUser);
    if (nextUser) {
      await PreferencesService.setJson(PreferenceKeys.localUser, nextUser);
    } else {
      await PreferencesService.removeItem(PreferenceKeys.localUser);
    }
  };

  const signOut = async () => {
    await AuthService.signOut();
    await setLocalUser(null);
  };

  useEffect(() => {
    PreferencesService.getJson(PreferenceKeys.localUser, null)
      .then((stored) => setLocalUserState(stored))
      .catch(() => setLocalUserState(null));
  }, []);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((nextUser) => {
      setFirebaseUser(nextUser);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: firebaseUser || localUser,
        firebaseUser,
        localUser,
        setLocalUser,
        signOut,
        authService: AuthService,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
