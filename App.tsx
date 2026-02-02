
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppState, UserProfile, StudySession, DoubtRecord, QuizResult, Chapter, NoteRecord } from './types.ts';
import { db } from './services/db.ts';
import { generateSchedule } from './services/scheduleService.ts';

// Screens
import LandingScreen from './screens/LandingScreen.tsx';
import AuthScreen from './screens/AuthScreen.tsx';
import OnboardingScreen from './screens/OnboardingScreen.tsx';
import DashboardScreen from './screens/DashboardScreen.tsx';
import StudyPlanScreen from './screens/StudyPlanScreen.tsx';
import DoubtSolverScreen from './screens/DoubtSolverScreen.tsx';
import QuizScreen from './screens/QuizScreen.tsx';
import ResultsScreen from './screens/ResultsScreen.tsx';
import FeedbackScreen from './screens/FeedbackScreen.tsx';
import ShortNotesScreen from './screens/ShortNotesScreen.tsx';

// Components
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import TabNavigation from './components/TabNavigation.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ 
    user: null, sessions: [], doubts: [], quizHistory: [], syllabus: [], notes: [] 
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const uid = db.getCurrentSessionUid();
      if (uid) {
        try {
          const cloudState = await db.hydrateState(uid);
          setState(cloudState);
        } catch (e) {
          console.error("Failed to hydrate cloud state", e);
        }
      }
      setIsInitializing(false);
    };
    init();
  }, []);

  const persist = useCallback(async (newState: AppState) => {
    if (!newState.user) return;
    setIsSyncing(true);
    try {
      await Promise.all([
        db.saveUserProfile(newState.user),
        db.saveSchedules(newState.user.uid, newState.sessions),
        db.saveDoubts(newState.user.uid, newState.doubts),
        db.saveQuizHistory(newState.user.uid, newState.quizHistory),
        db.saveProgress(newState.user.uid, newState.syllabus),
        db.saveNotes(newState.user.uid, newState.notes)
      ]);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleLogin = async (user: UserProfile) => {
    setIsInitializing(true);
    try {
      const cloudState = await db.hydrateState(user.uid);
      setState(cloudState);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogout = () => {
    db.clearSession();
    setState({ user: null, sessions: [], doubts: [], quizHistory: [], syllabus: [], notes: [] });
  };

  const completeOnboarding = async (profile: UserProfile, syllabus: Chapter[]) => {
    const sessions = generateSchedule(profile, syllabus);
    const newState = { ...state, user: profile, syllabus, sessions };
    setState(newState);
    await persist(newState);
  };

  const addNote = async (note: NoteRecord) => {
    setState(prev => {
      const newState = { ...prev, notes: [note, ...prev.notes] };
      persist(newState);
      return newState;
    });
  };

  const deleteNote = async (id: string) => {
    setState(prev => {
      const newState = { ...prev, notes: prev.notes.filter(n => n.id !== id) };
      persist(newState);
      return newState;
    });
  };

  const updateSession = async (updatedSession: StudySession) => {
    setState(prev => {
      const newState = {
        ...prev,
        sessions: prev.sessions.map(s => s.id === updatedSession.id ? updatedSession : s)
      };
      persist(newState);
      return newState;
    });
  };

  const addSession = async (session: StudySession) => {
    setState(prev => {
      const newState = { ...prev, sessions: [...prev.sessions, session] };
      persist(newState);
      return newState;
    });
  };

  const deleteSession = async (id: string) => {
    setState(prev => {
      const newState = { ...prev, sessions: prev.sessions.filter(s => s.id !== id) };
      persist(newState);
      return newState;
    });
  };

  const recalculatePlan = async () => {
    if (!state.user || !state.syllabus) return;
    const completedTopicTitles = new Set(
      state.sessions.filter(s => s.status === 'completed').map(s => s.topicTitle)
    );
    const remainingSyllabus = state.syllabus.map(ch => ({
      ...ch,
      topics: ch.topics.filter(t => !completedTopicTitles.has(t.title))
    }));
    const newSessions = generateSchedule(state.user, remainingSyllabus);
    setState(prev => {
      const newState = {
        ...prev,
        sessions: [...prev.sessions.filter(s => s.status === 'completed'), ...newSessions]
      };
      persist(newState);
      return newState;
    });
  };

  const updateProfile = async (profile: UserProfile) => {
    setState(prev => {
      const newState = { ...prev, user: profile };
      persist(newState);
      return newState;
    });
  };

  const addDoubt = async (doubt: DoubtRecord) => {
    setState(prev => {
      const newState = { ...prev, doubts: [doubt, ...prev.doubts] };
      persist(newState);
      return newState;
    });
  };

  const addQuizResult = async (result: QuizResult) => {
    setState(prev => {
      const updatedSyllabus = prev.syllabus.map(ch => {
        if (ch.subject === result.subject) {
          const topicIdx = ch.topics.findIndex(t => t.title === result.topicTitle);
          if (topicIdx !== -1) {
            const isSuccess = (result.score / result.total) >= 0.5;
            const updatedTopics = [...ch.topics];
            updatedTopics[topicIdx] = { 
              ...updatedTopics[topicIdx], 
              isCompleted: isSuccess ? true : updatedTopics[topicIdx].isCompleted,
              quizScore: result.score 
            };
            if (isSuccess && topicIdx < updatedTopics.length - 1) {
              updatedTopics[topicIdx + 1] = { ...updatedTopics[topicIdx + 1], isUnlocked: true };
            }
            return { ...ch, topics: updatedTopics };
          }
        }
        return ch;
      });
      const newState = { ...prev, quizHistory: [result, ...prev.quizHistory], syllabus: updatedSyllabus };
      persist(newState);
      return newState;
    });
  };

  const isAuthenticated = !!state.user;
  const isOnboarded = !!state.user?.onboarded;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center animate-bounce shadow-xl shadow-blue-200 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Syncing Study Lab...</h2>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-100">
        {isAuthenticated && <Navbar user={state.user} onLogout={handleLogout} isSyncing={isSyncing} />}
        <div className="flex flex-1 overflow-hidden relative">
          {isAuthenticated && isOnboarded && <Sidebar />}
          <main className="flex-1 overflow-y-auto relative p-4 md:p-8 scroll-smooth pb-32 md:pb-8">
            <Routes>
              <Route path="/" element={!isAuthenticated ? <LandingScreen /> : <Navigate to="/dashboard" />} />
              <Route path="/auth" element={<AuthScreen onLogin={handleLogin} />} />
              <Route path="/onboarding" element={isAuthenticated ? (isOnboarded ? <Navigate to="/dashboard" /> : <OnboardingScreen user={state.user!} onComplete={completeOnboarding} />) : <Navigate to="/auth" />} />
              <Route path="/dashboard" element={isAuthenticated ? (isOnboarded ? <DashboardScreen state={state} /> : <Navigate to="/onboarding" />) : <Navigate to="/auth" />} />
              <Route path="/study-plan" element={isAuthenticated ? <StudyPlanScreen tasks={state.sessions} user={state.user!} onUpdateSession={updateSession} onAddSession={addSession} onDeleteSession={deleteSession} onRecalculate={recalculatePlan} onUpdateProfile={updateProfile} /> : <Navigate to="/auth" />} />
              <Route path="/notes" element={isAuthenticated ? <ShortNotesScreen user={state.user!} notes={state.notes} onAddNote={addNote} onDeleteNote={deleteNote} /> : <Navigate to="/auth" />} />
              <Route path="/doubt-solver" element={isAuthenticated ? <DoubtSolverScreen user={state.user!} history={state.doubts} onAddDoubt={addDoubt} /> : <Navigate to="/auth" />} />
              <Route path="/quiz" element={isAuthenticated ? <QuizScreen user={state.user!} onResult={addQuizResult} /> : <Navigate to="/auth" />} />
              <Route path="/quiz/:subject/:topic" element={isAuthenticated ? <QuizScreen user={state.user!} onResult={addQuizResult} /> : <Navigate to="/auth" />} />
              <Route path="/results/:id" element={isAuthenticated ? <ResultsScreen history={state.quizHistory} /> : <Navigate to="/auth" />} />
              <Route path="/feedback" element={isAuthenticated ? <FeedbackScreen /> : <Navigate to="/auth" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          {isAuthenticated && isOnboarded && <TabNavigation />}
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
