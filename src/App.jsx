import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TimeAnalyzer from './pages/TimeAnalyzer';
import SmartStudy from './pages/SmartStudy';
import StudentMode from './pages/StudentMode';
import LifeScore from './pages/LifeScore';
import Leaderboard from './pages/Leaderboard';
import Rewards from './pages/Rewards';
import Streaks from './pages/Streaks';
import Planner from './pages/Planner';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ErrorBoundary from './components/ErrorBoundary';

// Sync component to bridge App.jsx state with AppContext
function UserSync({ user }) {
  const { updateProfile } = useApp();
  useEffect(() => {
    if (user) {
      updateProfile({
        name: user.name,
        email: user.email,
        avatar: user.avatar || ''
      });
    }
  }, [user, updateProfile]);
  return null;
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('focusflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSetUser = (u) => {
    setUser(u);
    if (u) {
      localStorage.setItem('focusflow_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('focusflow_user');
    }
  };

  return (
    <AppProvider>
      <UserSync user={user} />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login onLogin={handleSetUser} />} />
                <Route path="/signup" element={<Signup onLogin={handleSetUser} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <Route path="/" element={<Layout user={user} onLogout={() => handleSetUser(null)} />}>
                <Route index element={<Dashboard user={user} />} />
                <Route path="time-analyzer" element={<TimeAnalyzer />} />
                <Route path="smart-study" element={<SmartStudy />} />
                <Route path="student" element={<StudentMode />} />
                <Route path="life-score" element={<LifeScore />} />
                <Route path="leaderboard" element={<Leaderboard user={user} />} />
                <Route path="rewards" element={<Rewards />} />
                <Route path="streaks" element={<Streaks />} />
                <Route path="planner" element={<Planner />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            )}
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
