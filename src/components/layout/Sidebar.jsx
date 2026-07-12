import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Clock, BrainCircuit, Medal, Flame, GraduationCap, Trophy, Activity, CalendarDays, X, User, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
    { name: 'Dashboard', path: '/', icon: BarChart3 },
    { name: 'Time Analyzer', path: '/time-analyzer', icon: Clock },
    { name: 'Smart Study', path: '/smart-study', icon: BrainCircuit },
    { name: 'Planner', path: '/planner', icon: CalendarDays },
    { name: 'Student Mode', path: '/student', icon: GraduationCap },
    { name: 'Life Score', path: '/life-score', icon: Activity },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Rewards', path: '/rewards', icon: Medal },
    { name: 'Streaks', path: '/streaks', icon: Flame },
];

export default function Sidebar({ isOpen, setIsOpen, user, onLogout }) {
    const { getStreakCount, deepWorkActive, userProfile } = useApp();
    const streak = getStreakCount();

    return (
        <>
            {isOpen && (
                <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 45 }} />
            )}
            <aside className={`sidebar ${isOpen ? 'open' : ''} ${deepWorkActive ? 'deep-work' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-wrap">
                        <div className="logo-icon"><Activity size={24} color="white" /></div>
                        <span className="logo-text">FocusFlow</span>
                    </div>
                    <button className="icon-btn" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="nav-links">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                <Icon size={20} className="icon" />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <NavLink to="/profile" className="user-info" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }} onClick={() => setIsOpen(false)}>
                        <div style={{ width: 40, height: 40, overflow: 'hidden', padding: userProfile?.avatar ? 0 : '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', display: 'flex' }}>
                            {userProfile?.avatar ? (
                                <img src={userProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={20} className="text-muted" style={{ margin: 'auto' }} />
                            )}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {userProfile?.name || 'Student'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {userProfile?.email || 'student@focusflow.app'}
                            </div>
                        </div>
                    </NavLink>
                    <button className="icon-btn text-muted" title="Logout" onClick={onLogout}>
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>
        </>
    );
}
