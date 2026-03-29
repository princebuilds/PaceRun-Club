// App.jsx — Root component with app context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStore } from './store/useStore.js';
import Sidebar from './components/Layout/Sidebar.jsx';
import TopBar from './components/Layout/TopBar.jsx';
import NotesPanel from './components/Notes/NotesPanel.jsx';
import TasksPage from './components/Tasks/TasksPage.jsx';
import CalendarPage from './components/Calendar/CalendarPage.jsx';
import TimerPage from './components/Timer/TimerPage.jsx';
import SearchModal from './components/Search/SearchModal.jsx';

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function App() {
  const store = useStore();
  const [view, setView] = useState('notes');          // notes | tasks | calendar | timer
  const [activeFolder, setActiveFolder] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      store.settings.darkMode ? 'dark' : 'light'
    );
  }, [store.settings.darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const ctx = {
    ...store,
    view, setView,
    activeFolder, setActiveFolder,
    activeNote, setActiveNote,
    searchOpen, setSearchOpen,
  };

  return (
    <AppContext.Provider value={ctx}>
      <div className="app-layout">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <div className="flex-1 overflow-hidden">
            {view === 'notes'    && <NotesPanel />}
            {view === 'tasks'    && <TasksPage />}
            {view === 'calendar' && <CalendarPage />}
            {view === 'timer'    && <TimerPage />}
          </div>
        </div>
      </div>
      {searchOpen && <SearchModal />}
    </AppContext.Provider>
  );
}
