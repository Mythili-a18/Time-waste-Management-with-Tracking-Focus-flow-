import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AppContext = createContext(null);
const STORAGE_KEY = 'focusflow_appdata';

// ── Custom useLocalStorage hook ──
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        console.log(`📦 Storage: Loaded "${key}" → ✅ Found`);
        return {
           ...initialValue,
           ...parsed,
           userStats: { ...initialValue.userStats, ...(parsed.userStats || {}) },
           userProfile: { ...initialValue.userProfile, ...(parsed.userProfile || {}) },
           lifeScores: { ...initialValue.lifeScores, ...(parsed.lifeScores || {}) },
        };
      }
      console.log(`📦 Storage: Loaded "${key}" → ⚠️ Using defaults`);
      return initialValue;
    } catch (error) {
      console.error(`❌ Data Sync Failed: Could not load "${key}" from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    setStoredValue(value);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`❌ Data Sync Failed: Could not save "${key}" to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

const today = () => new Date().toISOString().slice(0, 10);

const defaults = {
  tasks: {},
  focusSessions: 0,
  xp: 0,
  streakDays: [],
  timeEntries: [
    { id: 1, name: 'Study', minutes: 180, category: 'productive' },
    { id: 2, name: 'Social Media', minutes: 120, category: 'wasted' },
    { id: 3, name: 'YouTube', minutes: 60, category: 'wasted' },
    { id: 4, name: 'Gaming', minutes: 90, category: 'wasted' },
  ],
  lifeScores: { Study: 90, Exercise: 60, Sleep: 85, Reading: 75, Skills: 80 },
  notifications: [
    { id: 1, text: 'Welcome to FocusFlow! Start your first Pomodoro session.', read: false, time: new Date().toISOString() },
    { id: 2, text: 'Tip: Log your daily time in the Time Analyzer.', read: false, time: new Date().toISOString() },
  ],
  focusMode: true,
  deepWorkActive: false,
  assignments: [
    { id: 1, title: 'Calculus Assignment 4', subject: 'Mathematics', due: 'Tomorrow', status: 'urgent' },
    { id: 2, title: 'Physics Lab Report', subject: 'Physics', due: 'In 3 Days', status: 'pending' },
    { id: 3, title: 'History Essay', subject: 'History', due: 'Next Week', status: 'pending' },
  ],
  exams: [
    { id: 1, title: 'Midterm Calculus', date: '2026-05-20', subject: 'Mathematics' },
    { id: 2, title: 'Physics Finals', date: '2026-06-10', subject: 'Physics' },
  ],
  blockerEnabled: false,
  streakFreezes: { used: 0, month: new Date().toISOString().slice(0, 7) },
  duelData: { active: false, opponent: 'Arjun', myStreak: 0, theirStreak: 8 },
  dailyLogs: {},
  focusCoins: 0,
  unlockedThemes: ['default'],
  activeTheme: 'default',
  badges: [],
  userStats: {
    streakCount: 0,
    lastLoginDate: null,
    totalTasksCompleted: 0,
    sessionStartTime: null,
    activeFocusMinutes: 0,
  },
  userProfile: {
    name: 'Dharanyad162005',
    email: 'student@focusflow.app',
    bio: 'Productivity enthusiast & lifelong learner.',
    avatar: ''
  },
  distractionData: { youtube: 0, instagram: 0, gaming: 0 }
};

export function AppProvider({ children }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, defaults);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wasteStats, setWasteStats] = useState({ wastedMinutes: 0, activeMinutes: 0, elapsedMinutes: 0, penaltyMinutes: 0, manualDistractions: 0 });

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  }, []);

  // ── MOUNT: Backend initialization log ──
  useEffect(() => {
    console.log('📡 System: Backend Logic Initialized');
    console.log('📊 Current State Snapshot:', {
      tasks: Object.keys(state.tasks).length + ' days tracked',
      totalTasks: Object.values(state.tasks).flat().length,
      xp: state.xp,
      focusCoins: state.focusCoins,
      focusSessions: state.focusSessions,
      streakDays: state.streakDays.length + ' days',
      assignments: state.assignments.length,
      exams: state.exams.length,
      userStats: state.userStats,
    });

    // ── Streak check on login ──
    const d = today();
    const lastLogin = state.userStats?.lastLoginDate;
    if (lastLogin !== d) {
      console.log(`🔄 Streak Logic: Last login was ${lastLogin || 'never'}, today is ${d}`);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);

      if (lastLogin === yStr) {
        console.log('✅ Streak Logic: Consecutive day! Streak maintained.');
      } else if (lastLogin && lastLogin !== yStr) {
        console.log('⚠️ Streak Logic: Streak broken! Last login was not yesterday.');
      }

      setState(prev => ({
        ...prev,
        userStats: { 
          ...prev.userStats, 
          lastLoginDate: d,
          sessionStartTime: new Date().toISOString(),
          activeFocusMinutes: 0
        },
      }));
    } else {
      // If same day but no sessionStartTime (e.g., first run after update)
      if (!state.userStats?.sessionStartTime) {
        setState(prev => ({
          ...prev,
          userStats: { ...prev.userStats, sessionStartTime: new Date().toISOString() }
        }));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps



  // ── 60-Second Background Calculation (Waste Time) ──
  useEffect(() => {
    const calcWasteStats = () => {
      const startStr = state.userStats?.sessionStartTime;
      if (!startStr) return;
      
      const startTime = new Date(startStr);
      const now = new Date();
      const elapsedMinutes = Math.max(0, Math.floor((now - startTime) / 60000));
      const activeMinutes = state.userStats?.activeFocusMinutes || 0;
      
      let penaltyMinutes = 0;
      const todayStr = new Date().toISOString().slice(0, 10);
      Object.entries(state.tasks).forEach(([dateKey, tasks]) => {
        if (dateKey < todayStr) {
          tasks.forEach(t => {
            if (!t.completed && t.priority === 'High') {
              const seededRandom = ((t.id * 9301 + 49297) % 233280) / 233280;
              penaltyMinutes += Math.floor(15 + seededRandom * 16);
            }
          });
        }
      });

      const manualDistractions = Object.values(state.distractionData || {}).reduce((a, b) => a + Number(b), 0);
      const wastedMinutes = Math.max(0, elapsedMinutes - activeMinutes) + penaltyMinutes + manualDistractions;

      setWasteStats({ wastedMinutes, activeMinutes, elapsedMinutes, penaltyMinutes, manualDistractions });
      console.log(`⏳ Waste Time Updated: Total Wasted=${wastedMinutes}m`);
    };

    calcWasteStats(); // Initial
    const id = setInterval(calcWasteStats, 60000);
    return () => clearInterval(id);
  }, [state.userStats, state.tasks, state.distractionData]);

  // ── Manual streak override (for debugging) ──
  const overrideStreak = useCallback((count) => {
    console.log(`🔧 Debug: Manual streak override → ${count} days`);
    const days = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    setState(prev => ({
      ...prev,
      streakDays: days,
      userStats: { ...prev.userStats, streakCount: count },
    }));
    console.log(`✅ Debug: Streak set to ${count} days. Days:`, days);
  }, [setState]);

  // Expose override to window for console debugging
  useEffect(() => {
    window.__focusflow_overrideStreak = overrideStreak;
    window.__focusflow_getState = () => state;
    window.__focusflow_resetState = () => {
      console.log('🔧 Debug: Resetting all state to defaults');
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    };
    console.log('🔧 Debug Tools Available:');
    console.log('  → window.__focusflow_overrideStreak(14)  // Set streak to 14 days');
    console.log('  → window.__focusflow_getState()          // View current state');
    console.log('  → window.__focusflow_resetState()        // Reset everything');
  }, [overrideStreak, state]);

  // ── Tasks (Planner) ──
  const getTasksForDate = useCallback((dateKey) => state.tasks[dateKey] || [], [state.tasks]);

  const addTask = useCallback((dateKey, taskData) => {
    const text = typeof taskData === 'string' ? taskData : taskData.text;
    const priority = typeof taskData === 'object' ? taskData.priority : 'Medium';
    const newTask = { id: Date.now(), text, completed: false, priority };
    console.log('📝 Task Added:', { dateKey, task: newTask });
    setState(prev => {
      const existing = prev.tasks[dateKey] || [];
      const updated = { ...prev.tasks, [dateKey]: [...existing, newTask] };
      const newState = { ...prev, tasks: updated };
      console.log(`📊 Tasks Updated: ${dateKey} now has ${updated[dateKey].length} task(s)`);
      return newState;
    });
  }, [setState]);

  const smartSortTasks = useCallback((dateKey) => {
    console.log(`🧠 Smart Sort applied for ${dateKey}`);
    setState(prev => {
      const list = prev.tasks[dateKey] || [];
      const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const sorted = [...list].sort((a, b) => {
         if (a.completed !== b.completed) return a.completed ? 1 : -1;
         return (priorityWeight[b.priority || 'Medium'] || 0) - (priorityWeight[a.priority || 'Medium'] || 0);
      });
      return { ...prev, tasks: { ...prev.tasks, [dateKey]: sorted } };
    });
  }, [setState]);

  // ── Life Scores ──
  const updateLifeScore = useCallback((category, value) => {
    console.log(`💚 Life Score Updated: ${category} → ${value}%`);
    setState(prev => ({ ...prev, lifeScores: { ...prev.lifeScores, [category]: Number(value) } }));
  }, [setState]);

  const getOverallLifeScore = useCallback(() => {
    const allTasks = Object.values(state.tasks).flat();
    const totalTasks = allTasks.length;
    if (totalTasks === 0) return 50;
    const completedTasks = allTasks.filter(t => t.completed).length;
    const taskScore = (completedTasks / totalTasks) * 40;

    const streakCount = (() => {
      const sorted = [...state.streakDays].sort().reverse();
      if (sorted.length === 0) return 0;
      let c = 1;
      for (let i = 1; i < sorted.length; i++) {
        const diff = Math.round((new Date(sorted[i - 1]) - new Date(sorted[i])) / (1000 * 60 * 60 * 24));
        if (diff === 1) c++; else break;
      }
      return c;
    })();
    const consistencyScore = Math.min((streakCount / 30) * 30, 30);

    const focusScore = Math.min((state.focusSessions / 20) * 30, 30);

    let finalScore = Math.min(Math.max(Math.round(taskScore + consistencyScore + focusScore), 0), 100);
    
    // Distraction Penalty
    const wastedMins = wasteStats?.wastedMinutes || 0;
    const penalty = Math.min(Math.floor(wastedMins / 10), 20); // max -20%
    finalScore = Math.max(0, finalScore - penalty);

    return finalScore;
  }, [state.tasks, state.streakDays, state.focusSessions, wasteStats?.wastedMinutes]);

  const toggleTask = useCallback((dateKey, taskId) => {
    const lifeScore = getOverallLifeScore();
    const multiplier = lifeScore > 80 ? 1.5 : 1;
    
    console.log('☑️ Task Toggled:', { dateKey, taskId });
    setState(prev => {
      let justCompleted = false;
      const list = (prev.tasks[dateKey] || []).map(t => {
        if (t.id === taskId) {
          const toggled = { ...t, completed: !t.completed };
          if (toggled.completed) justCompleted = true;
          console.log(`  → "${t.text}" → ${toggled.completed ? '✅ Completed' : '⬜ Uncompleted'}`);
          return toggled;
        }
        return t;
      });
      const completedCount = Object.values({ ...prev.tasks, [dateKey]: list }).flat().filter(t => t.completed).length;
      
      const earnedXP = justCompleted ? Math.round(10 * multiplier) : 0;
      const earnedCoins = justCompleted ? Math.round(5 * multiplier) : 0;
      if (justCompleted) console.log(`⭐ Earned ${earnedXP} XP & ${earnedCoins} Coins (Multiplier: ${multiplier}x)`);

      let newBadges = [...(prev.badges || [])];
      if (justCompleted && new Date().getHours() < 9 && !newBadges.includes('Early Bird')) {
        newBadges.push('Early Bird');
        triggerConfetti();
        console.log('🏆 Badge Unlocked: Early Bird');
      }

      return {
        ...prev,
        tasks: { ...prev.tasks, [dateKey]: list },
        userStats: { ...prev.userStats, totalTasksCompleted: completedCount },
        xp: prev.xp + earnedXP,
        focusCoins: (prev.focusCoins || 0) + earnedCoins,
        badges: newBadges,
      };
    });
  }, [setState, getOverallLifeScore, triggerConfetti]);
  const deleteTask = useCallback((dateKey, taskId) => {
    console.log('🗑️ Task Deleted:', { dateKey, taskId });
    setState(prev => {
      const deleted = (prev.tasks[dateKey] || []).find(t => t.id === taskId);
      if (deleted) console.log(`  → Removed: "${deleted.text}"`);
      const list = (prev.tasks[dateKey] || []).filter(t => t.id !== taskId);
      return { ...prev, tasks: { ...prev.tasks, [dateKey]: list } };
    });
  }, [setState]);

  // ── Focus Sessions & XP ──
  const addFocusSession = useCallback((minutes = 25) => {
    const lifeScore = getOverallLifeScore();
    const multiplier = lifeScore > 80 ? 1.5 : 1;
    const earnedXP = Math.round(20 * multiplier);
    const earnedCoins = Math.round(10 * multiplier);

    console.log(`🍅 Pomodoro Completed! +${earnedXP} XP, +${earnedCoins} Coins. Added ${minutes} active mins.`);
    setState(prev => {
      const newSessionCount = prev.focusSessions + 1;
      const newXP = prev.xp + earnedXP;
      const newCoins = (prev.focusCoins || 0) + earnedCoins;
      const newActiveMins = (prev.userStats?.activeFocusMinutes || 0) + minutes;
      
      console.log(`  → Sessions: ${newSessionCount}, Total XP: ${newXP}, Active Mins: ${newActiveMins}`);
      
      // Auto-unlock Focus Ninja/Master Badge
      let badges = prev.badges || [];
      if (newSessionCount >= 3 && !badges.includes('Focus Master')) {
        badges = [...badges, 'Focus Master'];
        triggerConfetti();
        console.log('🏆 Badge Unlocked: Focus Master!');
      }
      if (newSessionCount >= 3 && !badges.includes('Focus Ninja')) {
        badges = [...badges, 'Focus Ninja'];
      }

      const notif = { id: Date.now(), text: `Session done! +${earnedXP} XP, +${earnedCoins} Coins`, read: false, time: new Date().toISOString() };
      const d = today();
      const streakDays = prev.streakDays.includes(d) ? prev.streakDays : [...prev.streakDays, d];
      const dayLog = prev.dailyLogs[d] || { completed: 0, total: 0 };
      
      return {
        ...prev,
        focusSessions: newSessionCount, 
        xp: newXP,
        focusCoins: newCoins,
        badges,
        notifications: [notif, ...prev.notifications],
        streakDays,
        dailyLogs: { ...prev.dailyLogs, [d]: { completed: dayLog.completed + 1, total: dayLog.total + 1 } },
        userStats: { ...prev.userStats, activeFocusMinutes: newActiveMins },
      };
    });
  }, [setState, getOverallLifeScore]);

  const addXP = useCallback((amount) => {
    console.log(`⭐ XP Added: +${amount}`);
    setState(prev => ({ ...prev, xp: prev.xp + amount }));
  }, [setState]);

  // ── Streaks ──
  const markStreakDay = useCallback(() => {
    const d = today();
    setState(prev => {
      if (prev.streakDays.includes(d)) {
        console.log(`🔥 Streak: Today (${d}) already marked.`);
        return prev;
      }
      console.log(`🔥 Streak: Marking today (${d}) as active.`);
      return { ...prev, streakDays: [...prev.streakDays, d] };
    });
  }, [setState]);

  const getStreakCount = useCallback(() => {
    const sorted = [...state.streakDays].sort().reverse();
    if (sorted.length === 0) return 0;
    let count = 1;
    const d = today();
    if (sorted[0] !== d) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      if (sorted[0] !== yStr) return 0;
    }
    for (let i = 1; i < sorted.length; i++) {
      const curr = new Date(sorted[i - 1]);
      const prev = new Date(sorted[i]);
      const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diff === 1) count++;
      else break;
    }

    // Auto-unlock Streak Warrior and Consistency King
    if (count >= 14 && (!state.badges?.includes('Consistency King') || !state.badges?.includes('Streak Warrior'))) {
        setState(prev => {
            const currentBadges = prev.badges || [];
            if (currentBadges.includes('Consistency King') && currentBadges.includes('Streak Warrior')) return prev;
            
            const newBadges = [...currentBadges];
            if (!newBadges.includes('Consistency King')) newBadges.push('Consistency King');
            if (!newBadges.includes('Streak Warrior')) newBadges.push('Streak Warrior');
            
            triggerConfetti();
            console.log('🏆 Badges Unlocked: Consistency King, Streak Warrior!');
            return { ...prev, badges: newBadges };
        });
    }

    return count;
  }, [state.streakDays, state.badges, setState, triggerConfetti]);

  const getLongestStreak = useCallback(() => {
    const sorted = [...state.streakDays].sort();
    if (sorted.length === 0) return 0;
    let longest = 1, current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / (1000 * 60 * 60 * 24));
      if (diff === 1) { current++; longest = Math.max(longest, current); }
      else current = 1;
    }
    return longest;
  }, [state.streakDays]);

  // ── Streak Freeze ──
  const useStreakFreeze = useCallback(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setState(prev => {
      const freezes = prev.streakFreezes.month === currentMonth ? prev.streakFreezes : { used: 0, month: currentMonth };
      if (freezes.used >= 2) {
        console.log('❄️ Streak Freeze: No freezes remaining this month!');
        return prev;
      }
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      const streakDays = prev.streakDays.includes(yStr) ? prev.streakDays : [...prev.streakDays, yStr];
      console.log(`❄️ Streak Freeze Used! (${freezes.used + 1}/2 this month). Yesterday (${yStr}) protected.`);
      const notif = { id: Date.now(), text: `Streak Freeze used! (${freezes.used + 1}/2 this month)`, read: false, time: new Date().toISOString() };
      return { ...prev, streakFreezes: { used: freezes.used + 1, month: currentMonth }, streakDays, notifications: [notif, ...prev.notifications] };
    });
  }, [setState]);

  const getFreezesRemaining = useCallback(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (state.streakFreezes.month !== currentMonth) return 2;
    return 2 - state.streakFreezes.used;
  }, [state.streakFreezes]);

  // ── Duel Mode ──
  const startDuel = useCallback((opponent) => {
    console.log(`⚔️ Duel Mode: Starting duel with ${opponent}`);
    setState(prev => ({
      ...prev,
      duelData: { active: true, opponent, myStreak: 0, theirStreak: Math.floor(Math.random() * 15) + 3 },
    }));
  }, [setState]);

  // ── Time Entries ──
  const logTime = useCallback((name, minutes, category) => {
    const entry = { id: Date.now(), name, minutes: Number(minutes), category };
    console.log('⏱️ Time Logged:', entry);
    setState(prev => ({
      ...prev,
      timeEntries: [...prev.timeEntries, entry],
    }));
  }, [setState]);


  // ── Notifications ──
  const addNotification = useCallback((text) => {
    console.log('🔔 Notification:', text);
    setState(prev => ({
      ...prev,
      notifications: [{ id: Date.now(), text, read: false, time: new Date().toISOString() }, ...prev.notifications],
    }));
  }, [setState]);

  const markNotificationRead = useCallback((id) => {
    console.log('👁️ Notification Read:', id);
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  }, [setState]);

  const markAllNotificationsRead = useCallback(() => {
    console.log('👁️ All Notifications Marked Read');
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
    }));
  }, [setState]);

  // ── Focus Mode ──
  const toggleFocusMode = useCallback(() => {
    setState(prev => {
      console.log(`⚡ Focus Mode: ${prev.focusMode ? 'Deactivated' : 'Activated'}`);
      return { ...prev, focusMode: !prev.focusMode };
    });
  }, [setState]);

  // ── Deep Work ──
  const toggleDeepWork = useCallback(() => {
    setState(prev => {
      const next = !prev.deepWorkActive;
      console.log(`🔇 Deep Work Mode: ${next ? 'ACTIVATED — Distractions silenced' : 'DEACTIVATED'}`);
      const notif = { id: Date.now(), text: next ? '🔇 Deep Work mode activated.' : 'Deep Work mode deactivated.', read: false, time: new Date().toISOString() };
      return { ...prev, deepWorkActive: next, notifications: [notif, ...prev.notifications] };
    });
  }, [setState]);

  // ── Blocker ──
  const toggleBlocker = useCallback(() => {
    setState(prev => {
      const next = !prev.blockerEnabled;
      console.log(`🛡️ Distraction Blocker: ${next ? 'ENABLED' : 'DISABLED'}`);
      const notif = { id: Date.now(), text: next ? 'Distraction Blocker enabled!' : 'Distraction Blocker disabled.', read: false, time: new Date().toISOString() };
      return { ...prev, blockerEnabled: next, notifications: [notif, ...prev.notifications] };
    });
  }, [setState]);

  // ── Nudge ──
  const nudgeLoggedRef = useRef(false);
  const checkNudge = useCallback(() => {
    const now = new Date();
    if (now.getHours() < 14) return false;
    const d = today();
    const todayTasks = state.tasks[d] || [];
    const shouldNudge = todayTasks.length === 0;
    if (shouldNudge && !nudgeLoggedRef.current) {
      console.log('⏰ Nudge: Past 2 PM, no tasks logged today. Showing banner.');
      nudgeLoggedRef.current = true;
    } else if (!shouldNudge) {
      nudgeLoggedRef.current = false;
    }
    return shouldNudge;
  }, [state.tasks]);

  // ── Assignments ──
  const addAssignment = useCallback((assignment) => {
    const newAssignment = { id: Date.now(), status: 'pending', ...assignment };
    console.log('📚 Assignment Added:', newAssignment);
    setState(prev => ({ ...prev, assignments: [newAssignment, ...prev.assignments] }));
  }, [setState]);

  const completeAssignment = useCallback((id) => {
    const lifeScore = getOverallLifeScore();
    const multiplier = lifeScore > 80 ? 1.5 : 1;
    const earnedXP = Math.round(10 * multiplier);
    const earnedCoins = Math.round(5 * multiplier);

    setState(prev => {
      const found = prev.assignments.find(a => a.id === id);
      console.log(`✅ Assignment Completed: ${found?.title}. +${earnedXP} XP, +${earnedCoins} Coins`);
      const d = today();
      const dayLog = prev.dailyLogs[d] || { completed: 0, total: 0 };
      const notif = { id: Date.now(), text: `Assignment completed! +${earnedXP} XP`, read: false, time: new Date().toISOString() };
      const streakDays = prev.streakDays.includes(d) ? prev.streakDays : [...prev.streakDays, d];
      return {
        ...prev,
        assignments: prev.assignments.filter(a => a.id !== id),
        xp: prev.xp + earnedXP,
        focusCoins: (prev.focusCoins || 0) + earnedCoins,
        notifications: [notif, ...prev.notifications],
        streakDays,
        dailyLogs: { ...prev.dailyLogs, [d]: { completed: dayLog.completed + 1, total: dayLog.total + 1 } },
        userStats: { ...prev.userStats, totalTasksCompleted: (prev.userStats?.totalTasksCompleted || 0) + 1 },
      };
    });
  }, [setState, getOverallLifeScore]);

  // ── Exams ──
  const addExam = useCallback((exam) => {
    const newExam = { id: Date.now(), ...exam };
    console.log('📅 Exam Added:', newExam);
    setState(prev => ({ ...prev, exams: [...prev.exams, newExam] }));
  }, [setState]);

  const deleteExam = useCallback((id) => {
    console.log('🗑️ Exam Deleted:', id);
    setState(prev => ({ ...prev, exams: prev.exams.filter(e => e.id !== id) }));
  }, [setState]);

  // ── Computed ──
  const getTotalCompletedTasks = useCallback(() => Object.values(state.tasks).flat().filter(t => t.completed).length, [state.tasks]);
  const getTotalTasks = useCallback(() => Object.values(state.tasks).flat().length, [state.tasks]);

  const getLevel = useCallback(() => {
    if (state.xp >= 2000) return { level: 20, title: 'Time Lord', next: Infinity };
    if (state.xp >= 1000) return { level: 10, title: 'Productivity Master', next: 2000 };
    if (state.xp >= 400) return { level: 5, title: 'Focus Warrior', next: 1000 };
    return { level: 1, title: 'Beginner', next: 400 };
  }, [state.xp]);

  const getMostProductiveDay = useCallback(() => {
    const dayCounts = {};
    Object.entries(state.dailyLogs).forEach(([date, log]) => {
      const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'long' });
      dayCounts[dayName] = (dayCounts[dayName] || 0) + log.completed;
    });
    Object.entries(state.tasks).forEach(([date, tasks]) => {
      const completed = tasks.filter(t => t.completed).length;
      if (completed > 0) {
        const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'long' });
        dayCounts[dayName] = (dayCounts[dayName] || 0) + completed;
      }
    });
    if (Object.keys(dayCounts).length === 0) return 'Sunday';
    return Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0][0];
  }, [state.dailyLogs, state.tasks]);

  const addDistraction = useCallback((platform, minutes) => {
    setState(prev => {
      const current = prev.distractionData || { youtube: 0, instagram: 0, gaming: 0 };
      return {
        ...prev,
        distractionData: {
          ...current,
          [platform]: (current[platform] || 0) + Number(minutes)
        }
      };
    });
  }, [setState]);

  const purchaseTheme = useCallback((themeId, cost) => {
    setState(prev => {
      if ((prev.focusCoins || 0) < cost) {
        console.log(`❌ Cannot purchase ${themeId}: insufficient coins.`);
        return prev;
      }
      if (prev.unlockedThemes?.includes(themeId)) {
        return { ...prev, activeTheme: themeId };
      }
      console.log(`🛍️ Purchased Theme: ${themeId} for ${cost} coins!`);
      return {
        ...prev,
        focusCoins: prev.focusCoins - cost,
        unlockedThemes: [...(prev.unlockedThemes || []), themeId],
        activeTheme: themeId,
      };
    });
  }, [setState]);

  const applyTheme = useCallback((themeId) => {
    setState(prev => ({ ...prev, activeTheme: themeId }));
  }, [setState]);

  const updateProfile = useCallback((newData) => {
    setState(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...newData } }));
  }, [setState]);

  const value = {
    ...state,
    // Tasks
    getTasksForDate, addTask, toggleTask, deleteTask, getTotalCompletedTasks, getTotalTasks, smartSortTasks,
    // Focus
    addFocusSession, addXP,
    // Streaks
    markStreakDay, getStreakCount, getLongestStreak, overrideStreak,
    useStreakFreeze, getFreezesRemaining,
    startDuel,
    // Time
    logTime,
    // Life
    updateLifeScore, getOverallLifeScore,
    // Notifications
    addNotification, markNotificationRead, markAllNotificationsRead,
    // Profile
    updateProfile,
    // Modes
    toggleFocusMode, toggleDeepWork, toggleBlocker, checkNudge,
    // Assignments
    addAssignment, completeAssignment,
    // Exams
    addExam, deleteExam,
    // Rewards
    getLevel, getMostProductiveDay, purchaseTheme, applyTheme,
    // Waste Time & Distractions
    wasteStats, addDistraction,
    // Gamification & UI
    showConfetti, triggerConfetti,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
