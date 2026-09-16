// AppProvider: Root context for global app state (theme, locale, etc.)
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [locale, setLocale] = useState('en');

  return (
    <AppContext.Provider value={{ theme, setTheme, locale, setLocale }}>
      {children}
    </AppContext.Provider>
  );
};
