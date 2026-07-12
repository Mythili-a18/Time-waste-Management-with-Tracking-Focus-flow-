import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, FileText, Check, Camera, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Profile() {
    const { userProfile, updateProfile } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        bio: userProfile?.bio || '',
        avatar: userProfile?.avatar || '',
    });
    const fileInputRef = useRef(null);

    // Sync form data when userProfile changes or when entering edit mode
    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: userProfile?.name || '',
                email: userProfile?.email || '',
                bio: userProfile?.bio || '',
                avatar: userProfile?.avatar || '',
            });
        }
    }, [isEditing, userProfile]);

    const handleSave = (e) => {
        e.preventDefault();
        updateProfile(formData);
        setIsEditing(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="page-header" style={{ justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title text-white">Your Profile</h1>
                    <p className="page-subtitle text-muted">Manage your personal information and settings.</p>
                </div>
                {!isEditing && (
                    <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div className="flex items-center gap-6 mb-8">
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px dashed var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {isEditing && formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : !isEditing && userProfile?.avatar ? (
                                <img src={userProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={40} className="text-primary" />
                            )}
                        </div>
                        {isEditing && (
                            <>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn" style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--bg-dark)', border: '1px solid var(--border-light)' }}>
                                    <Camera size={16} className="text-white" />
                                </button>
                                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                            </>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1 font-display">{userProfile?.name}</h2>
                        <span className="badge flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Shield size={12} /> Student Account</span>
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-bold text-muted mb-2 block">Display Name</label>
                            <div className="flex items-center gap-3" style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                <User size={20} className="text-primary" />
                                <input type="text" className="w-full bg-transparent border-none text-white outline-none" style={{ color: '#ffffff', background: 'transparent', appearance: 'none', WebkitAppearance: 'none' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-muted mb-2 block">Email Address</label>
                            <div className="flex items-center gap-3" style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                <Mail size={20} className="text-blue" />
                                <input type="email" className="w-full bg-transparent border-none text-white outline-none" style={{ color: '#ffffff', background: 'transparent', appearance: 'none', WebkitAppearance: 'none' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-muted mb-2 block">Bio</label>
                            <div className="flex items-start gap-3" style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                <FileText size={20} className="text-yellow mt-1" />
                                <textarea className="w-full bg-transparent border-none text-white outline-none resize-none" style={{ color: '#ffffff', background: 'transparent', appearance: 'none', WebkitAppearance: 'none' }} rows="3" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Check size={20} /> Save Changes</button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '12px' }}><Mail size={24} className="text-blue" /></div>
                            <div>
                                <p className="text-sm font-bold text-muted">Email Address</p>
                                <p className="text-white text-lg">{userProfile?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div style={{ background: 'rgba(234,179,8,0.1)', padding: '1rem', borderRadius: '12px' }}><FileText size={24} className="text-yellow" /></div>
                            <div>
                                <p className="text-sm font-bold text-muted">Bio</p>
                                <p className="text-white text-lg">{userProfile?.bio || 'No bio provided yet.'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
