import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Activity } from 'lucide-react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            // Create derived mock user object based on email
            const mockName = email.split('@')[0];
            const capitalized = mockName.charAt(0).toUpperCase() + mockName.slice(1);

            onLogin({
                name: capitalized,
                email: email,
                avatar: null, // Shows default icon
            });
            navigate('/');
        }
    };

    return (
        <div className="auth-container">
            <div className="bg-effects">
                <div className="bg-blob1" />
                <div className="bg-blob2" />
            </div>

            <div className="auth-panel" style={{ position: 'relative', zIndex: 10 }}>
                <div className="auth-header">
                    <div className="logo-icon" style={{ margin: '0 auto 1.5rem', width: 56, height: 56, borderRadius: '1rem' }}>
                        <Activity size={32} color="white" />
                    </div>
                    <h1 className="auth-title">Welcome Back 👋</h1>
                    <p className="auth-subtitle">Continue your journey to higher productivity.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <Mail className="auth-icon" size={20} />
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <Lock className="auth-icon" size={20} />
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn">
                        Sign In <LogIn size={20} />
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
