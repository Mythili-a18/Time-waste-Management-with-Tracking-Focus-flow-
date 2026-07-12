import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Camera, Activity } from 'lucide-react';

export default function Signup({ onLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && email) {
            onLogin({
                name: name,
                email: email,
                avatar: avatar,
            });
            navigate('/');
        }
    };

    return (
        <div className="auth-container">
            <div className="bg-effects">
                <div className="bg-blob1" style={{ background: 'rgba(59,130,246,0.12)' }} />
                <div className="bg-blob2" style={{ background: 'rgba(168,85,247,0.12)' }} />
            </div>

            <div className="auth-panel border-purple" style={{ border: '1px solid rgba(59,130,246,0.3)', position: 'relative', zIndex: 10 }}>
                <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
                    <div className="logo-icon" style={{ margin: '0 auto 1.5rem', background: 'linear-gradient(135deg, var(--blue), var(--purple))', width: 56, height: 56, borderRadius: '1rem', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}>
                        <Activity size={32} color="white" />
                    </div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join FocusFlow and own your time.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="auth-avatar-upload" onClick={() => fileInputRef.current?.click()} style={{ borderStyle: avatar ? 'solid' : 'dashed' }}>
                        {avatar ? (
                            <img src={avatar} alt="Avatar profile preview" />
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <Camera size={28} />
                                <div style={{ fontSize: '0.65rem', marginTop: '0.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>UPLOAD</div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="auth-input-group">
                        <User className="auth-icon" size={20} />
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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

                    <button type="submit" className="btn btn-primary auth-btn" style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>
                        Sign Up <UserPlus size={20} />
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link" style={{ color: 'var(--blue)' }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
}
