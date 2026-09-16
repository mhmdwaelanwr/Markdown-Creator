// LibraryProvider: Manages library state (converted from Flutter LibraryProvider)
import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PreferenceKeys, PreferencesService } from '../services/preferencesService';
import { SavedProject } from '../models/SavedProject';
import { Snippet } from '../models/Snippet';

export const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const savedProjects = await PreferencesService.getJson(PreferenceKeys.savedProjects, []);
      const savedSnippets = await PreferencesService.getJson(PreferenceKeys.savedSnippets, []);
      if (Array.isArray(savedProjects)) {
        setProjects(savedProjects.map((p) => SavedProject.fromJson(p)));
      }
      if (Array.isArray(savedSnippets)) {
        setSnippets(savedSnippets.map((s) => Snippet.fromJson(s)));
      }
    } catch (error) {
      console.error('Failed to load library', error);
    }
  };

  const persistProjects = async (nextProjects) => {
    setProjects(nextProjects);
    await PreferencesService.setJson(
      PreferenceKeys.savedProjects,
      nextProjects.map((project) => project.toJson())
    );
  };

  const persistSnippets = async (nextSnippets) => {
    setSnippets(nextSnippets);
    await PreferencesService.setJson(
      PreferenceKeys.savedSnippets,
      nextSnippets.map((snippet) => snippet.toJson())
    );
  };

  const saveProject = ({ name, description = '', tags = [], jsonContent }) => {
    const project = new SavedProject({
      id: uuidv4(),
      name,
      description,
      tags,
      jsonContent,
      lastModified: new Date().toISOString(),
    });
    const next = [project, ...projects];
    persistProjects(next);
    return project;
  };

  const updateProject = (id, patch = {}) => {
    const next = projects.map((project) =>
      project.id === id
        ? new SavedProject({
            ...project.toJson(),
            ...patch,
            lastModified: new Date().toISOString(),
          })
        : project
    );
    persistProjects(next);
  };

  const deleteProject = (id) => {
    const next = projects.filter((project) => project.id !== id);
    persistProjects(next);
  };

  const saveSnippet = ({ name, elementJson }) => {
    const snippet = new Snippet({ id: uuidv4(), name, elementJson });
    const next = [snippet, ...snippets];
    persistSnippets(next);
    return snippet;
  };

  const deleteSnippet = (id) => {
    const next = snippets.filter((snippet) => snippet.id !== id);
    persistSnippets(next);
  };

  return (
    <LibraryContext.Provider
      value={{
        projects,
        snippets,
        isFirebaseAvailable,
        setIsFirebaseAvailable,
        saveProject,
        updateProject,
        deleteProject,
        saveSnippet,
        deleteSnippet,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => useContext(LibraryContext);
