import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu, Search, Bell, Zap, ZapOff, AlertCircle } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Confetti from '../Confetti';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/' },
  { name: 'Time Analyzer', path: '/time-analyzer' },
  { name: 'Smart Study', path: '/smart-study' },
  { name: 'Planner', path: '/planner' },
  { name: 'Student Mode', path: '/student' },
  { name: 'Life Score', path: '/life-score' },
  { name: 'Leaderboard', path: '/leaderboard' },
  { name: 'Rewards', path: '/rewards' },
  { name: 'Streaks', path: '/streaks' },
];

export default function Layout({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [wastePopupDismissed, setWastePopupDismissed] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead, focusMode, toggleFocusMode, deepWorkActive, checkNudge, wasteStats, activeTheme, showConfetti } = useApp();
  const { wastedMinutes } = wasteStats || { wastedMinutes: 0 };
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme || 'default');
  }, [activeTheme]);

  useEffect(() => {
    console.log('🖥️ Layout: Mounted. User:', user?.name || 'Unknown');
  }, []);

  const filteredNav = searchQuery.trim()
    ? NAV_ITEMS.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const unreadCount = notifications.filter(n => !n.read).length;
  const [showNudge, setShowNudge] = useState(false);
  
  useEffect(() => {
      setShowNudge(checkNudge());
  }, [checkNudge]);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) console.log('🔍 Search:', val);
  };

  const handleNavClick = (item) => {
    console.log('🔍 Search Navigate →', item.name, item.path);
    navigate(item.path);
    setSearchQuery('');
  };

  const handleNotifToggle = () => {
    const next = !showNotifs;
    setShowNotifs(next);
    console.log(`🔔 Notifications: ${next ? 'Opened' : 'Closed'} (${unreadCount} unread)`);
  };

  const handleFocusToggle = () => {
    console.log(`⚡ Focus Mode Toggle clicked`);
    toggleFocusMode();
  };

  return (
    <div className="app-container">
      <Confetti active={showConfetti} />
      <div className="bg-effects">
        <div className="bg-blob1" />
        <div className="bg-blob2" />
      </div>

      {deepWorkActive && <div className="deep-work-overlay" />}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} onLogout={onLogout} />

      <main className="main-content">
        {showNudge && !deepWorkActive && location.pathname === '/' && (
          <div className="nudge-banner">
            <AlertCircle size={18} />
            <span>⏰ It's past 2 PM and you haven't logged any tasks today! Head to the Planner to get started.</span>
          </div>
        )}

        <header className="top-header">
          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="search-box">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search tasks, tools..."
                value={searchQuery}
                onChange={handleSearch}
              />
              {filteredNav.length > 0 && (
                <div className="search-dropdown">
                  {filteredNav.map(item => (
                    <a key={item.path} href="#" onClick={(e) => { e.preventDefault(); handleNavClick(item); }}>
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={handleNotifToggle}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: 'var(--red)', borderRadius: '50%', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-bold">Notifications</h4>
                    <button className="btn btn-sm btn-outline" onClick={() => { markAllNotificationsRead(); }}>Mark all read</button>
                  </div>
                  {notifications.slice(0, 10).map(n => (
                    <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => markNotificationRead(n.id)}>
                      <p className="text-sm" style={{ color: n.read ? 'var(--text-muted)' : 'white' }}>{n.text}</p>
                      <p className="text-xs text-muted" style={{ marginTop: 4 }}>{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-muted text-sm text-center py-4">No notifications yet</p>}
                </div>
              )}
            </div>
            <button
              className="flex items-center gap-2 icon-btn"
              onClick={handleFocusToggle}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid ' + (focusMode ? 'rgba(34,197,94,0.3)' : 'var(--border-light)'), background: focusMode ? 'rgba(34,197,94,0.1)' : 'transparent' }}
            >
              {focusMode ? <Zap size={16} className="text-primary" /> : <ZapOff size={16} />}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: focusMode ? 'var(--primary)' : 'var(--text-muted)' }}>Focus Mode</div>
                <div style={{ fontSize: '0.65rem', color: focusMode ? 'var(--primary)' : 'var(--text-muted)' }}>{focusMode ? 'Active' : 'Off'}</div>
              </div>
            </button>
          </div>
        </header>

        <div className="page-container">
          {/* Waste Time Alert Popup */}
        {wastedMinutes >= 120 && !wastePopupDismissed && (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="glass-panel" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative' }}>
              <AlertCircle size={48} className="text-red mb-4 mx-auto" />
              <h2 className="text-white font-bold text-xl mb-2">High Waste Time Detected</h2>
              <p className="text-muted mb-6">You've accumulated {Math.floor(wastedMinutes / 60)}h {wastedMinutes % 60}m of unaccounted time today. Get back on track with a quick session!</p>
              <div className="flex gap-3">
                <button className="btn btn-primary flex-1" onClick={() => { setWastePopupDismissed(true); navigate('/study'); }}>Quick Reset</button>
                <button className="btn btn-outline flex-1" onClick={() => setWastePopupDismissed(true)}>Dismiss</button>
              </div>
            </div>
          </div>
        )}

        <Outlet />
        </div>
      </main>
    </div>
  );
}
