// ProjectProvider: Manages project state (converted from Flutter ProjectProvider)
import React, { createContext, useState } from 'react';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [themeMode, setThemeMode] = useState('light');
  const [locale, setLocale] = useState('en');

  return (
    <ProjectContext.Provider value={{ project, setProject, themeMode, setThemeMode, locale, setLocale }}>
      {children}
    </ProjectContext.Provider>
  );
};
