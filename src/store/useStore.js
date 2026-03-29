// store/useStore.js — Central state management using localStorage
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  NOTES: 'noteflow_notes',
  FOLDERS: 'noteflow_folders',
  TASKS: 'noteflow_tasks',
  EVENTS: 'noteflow_events',
  SETTINGS: 'noteflow_settings',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Default folders
const DEFAULT_FOLDERS = [
  { id: 'default', name: 'Personal', color: '#6366f1', icon: '📝', createdAt: Date.now() },
  { id: 'work', name: 'Work', color: '#10b981', icon: '💼', createdAt: Date.now() },
];

export function useStore() {
  const [notes, setNotes] = useState(() => load(STORAGE_KEYS.NOTES, []));
  const [folders, setFolders] = useState(() => load(STORAGE_KEYS.FOLDERS, DEFAULT_FOLDERS));
  const [tasks, setTasks] = useState(() => load(STORAGE_KEYS.TASKS, []));
  const [events, setEvents] = useState(() => load(STORAGE_KEYS.EVENTS, []));
  const [settings, setSettings] = useState(() => load(STORAGE_KEYS.SETTINGS, { darkMode: true, fontSize: 'md' }));

  // Persist on change
  useEffect(() => { save(STORAGE_KEYS.NOTES, notes); }, [notes]);
  useEffect(() => { save(STORAGE_KEYS.FOLDERS, folders); }, [folders]);
  useEffect(() => { save(STORAGE_KEYS.TASKS, tasks); }, [tasks]);
  useEffect(() => { save(STORAGE_KEYS.EVENTS, events); }, [events]);
  useEffect(() => { save(STORAGE_KEYS.SETTINGS, settings); }, [settings]);

  // ── Notes ──────────────────────────────────────────────
  const createNote = useCallback((folderId = 'default') => {
    const note = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      folderId,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      drawings: [],
      images: [],
    };
    setNotes(prev => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback((id, updates) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    ));
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setTasks(prev => prev.filter(t => t.noteId !== id));
  }, []);

  // ── Folders ────────────────────────────────────────────
  const createFolder = useCallback((name, color = '#6366f1', icon = '📁') => {
    const folder = { id: uuidv4(), name, color, icon, createdAt: Date.now() };
    setFolders(prev => [...prev, folder]);
    return folder;
  }, []);

  const updateFolder = useCallback((id, updates) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const deleteFolder = useCallback((id) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setNotes(prev => prev.map(n => n.folderId === id ? { ...n, folderId: 'default' } : n));
  }, []);

  // ── Tasks ──────────────────────────────────────────────
  const createTask = useCallback((data) => {
    const task = {
      id: uuidv4(),
      title: '',
      completed: false,
      priority: 'medium',
      deadline: null,
      noteId: null,
      tags: [],
      createdAt: Date.now(),
      ...data,
    };
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Events ─────────────────────────────────────────────
  const createEvent = useCallback((data) => {
    const event = {
      id: uuidv4(),
      title: '',
      date: new Date().toISOString().split('T')[0],
      color: '#6366f1',
      noteId: null,
      createdAt: Date.now(),
      ...data,
    };
    setEvents(prev => [...prev, event]);
    return event;
  }, []);

  const updateEvent = useCallback((id, updates) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // ── Settings ───────────────────────────────────────────
  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    notes, folders, tasks, events, settings,
    createNote, updateNote, deleteNote,
    createFolder, updateFolder, deleteFolder,
    createTask, updateTask, deleteTask,
    createEvent, updateEvent, deleteEvent,
    updateSettings,
  };
}
