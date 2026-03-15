import React from 'react';
import { User, Mail, Calendar, LogOut, Shield, Award, MapPin, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { userData, logout, isAdmin, updateUserData } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = React.useState(false);
    const [editData, setEditData] = React.useState({});

    React.useEffect(() => {
        if (userData) {
            setEditData({
                realName: userData.realName || '',
                freeFireUID: userData.freeFireUID || '',
                gameName: userData.gameName || '',
                phone: userData.phone || ''
            });
        }
    }, [userData]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            console.log("Saving user data:", editData);
            await updateUserData(editData);
            setIsEditing(false);
            alert("✅ Profile updated successfully!");
        } catch (error) {
            console.error("Update error:", error);
            alert(`❌ Failed to update profile: ${error.message || 'Unknown error'}`);
        }
    };

    if (!userData) return (
        <div className="flex flex-col items-center justify-center min-vh-100 p-5" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loading-screen text-center mb-4 text-2xl font-bold text-gradient">Loading Profile...</div>
            <p className="text-muted text-sm anim-pulse">Synchronizing with FireBattle servers...</p>
        </div>
    );

    return (
        <div className="dashboard-page fade-in container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Profile Overview Card */}
                <div className="lg:col-span-1">
                    <div className="glass-panel profile-card p-6 text-center">
                        <div className="profile-photo-wrapper mb-4">
                            {userData.profilePhoto ? (
                                <img src={userData.profilePhoto} alt="Profile" className="profile-img" />
                            ) : (
                                <div className="profile-placeholder">
                                    <User size={64} />
                                </div>
                            )}
                            <button className="edit-photo-btn">
                                <Edit2 size={16} />
                            </button>
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-1">{userData.username}</h2>
                        <p className="text-muted flex items-center justify-center gap-2 mb-4">
                            <Mail size={14} /> {userData.email}
                        </p>
                        
                        <div className="flex justify-center gap-3 mb-6">
                            {isAdmin && (
                                <span className="badge badge-admin flex items-center gap-1">
                                    <Shield size={12} /> Admin
                                </span>
                            )}
                            <span className="badge badge-user">Pro Player</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-800 py-6 mb-6">
                            <div className="stat-item">
                                <span className="stat-value">{userData.matchesPlayed || 0}</span>
                                <span className="stat-label">Matches</span>
                            </div>
                            <div className="stat-item border-l border-gray-800">
                                <span className="stat-value">{userData.totalWins || 0}</span>
                                <span className="stat-label">Wins</span>
                            </div>
                        </div>

                        <button onClick={() => setIsEditing(true)} className="btn btn-primary w-full mb-3 flex items-center justify-center gap-2">
                             <Edit2 size={18} /> Edit Profile
                        </button>

                        <button onClick={handleLogout} className="btn btn-outline w-full flex items-center justify-center gap-2">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>

                {/* Account Details & Activity */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-8 mb-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Award className="text-primary" /> Account Statistics
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="info-card p-4 rounded-lg bg-black/30 border border-white/5">
                                <p className="text-xs text-muted uppercase tracking-wider mb-1">Full Name</p>
                                <p className="font-medium">{userData.realName || 'Not set'}</p>
                            </div>
                            <div className="info-card p-4 rounded-lg bg-black/30 border border-white/5">
                                <p className="text-xs text-muted uppercase tracking-wider mb-1">In-Game Name</p>
                                <p className="font-bold text-success">{userData.gameName || 'Not set'}</p>
                            </div>
                            <div className="info-card p-4 rounded-lg bg-black/30 border border-white/5">
                                <p className="text-xs text-muted uppercase tracking-wider mb-1">Free Fire UID</p>
                                <p className="font-mono text-primary font-bold">{userData.freeFireUID || 'Not set'}</p>
                            </div>
                            <div className="info-card p-4 rounded-lg bg-black/30 border border-white/5">
                                <p className="text-xs text-muted uppercase tracking-wider mb-1">Phone Number</p>
                                <p className="font-medium">{userData.phone || 'Not set'}</p>
                            </div>
                            <div className="info-card p-4 rounded-lg bg-black/30 border border-white/5">
                                <p className="text-xs text-muted uppercase tracking-wider mb-1">Joined Date</p>
                                <p className="font-medium">
                                    {userData.joinedAt ? new Date(userData.joinedAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                                </p>
                            </div>
                            <div className="info-card p-4 rounded-lg bg-black/30 border border-white/5">
                                <p className="text-xs text-muted uppercase tracking-wider mb-1">Rank</p>
                                <p className="font-bold text-warning">{userData.rank || 'Beginner'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Recent Participations</h3>
                            <button className="text-sm text-primary hover-underline">View All</button>
                        </div>
                        
                        <div className="space-y-4">
                            {userData.participations?.length > 0 ? (
                                userData.participations.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                T{i+1}
                                            </div>
                                            <div>
                                                <p className="font-bold">{p.tournamentName}</p>
                                                <p className="text-xs text-muted">{new Date(p.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${p.prize > 0 ? 'text-success' : 'text-muted'}`}>
                                                {p.prize > 0 ? `+ ₹${p.prize}` : 'Finished'}
                                            </p>
                                            <p className="text-xs text-muted">Position: #{p.position}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted">
                                    <p>No tournament participation history found.</p>
                                    <button className="btn btn-primary btn-sm mt-4" onClick={() => navigate('/tournaments')}>Find Matches</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="modal-overlay fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
                    <div className="modal-content glass-panel p-8 w-full max-w-md fade-in">
                        <h3 className="text-2xl font-bold mb-6 text-gradient">Update Profile</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-muted block mb-2 px-1">Full Name</label>
                                <input 
                                    type="text" 
                                    className="dash-input w-full"
                                    value={editData.realName}
                                    onChange={(e) => setEditData({...editData, realName: e.target.value})}
                                    placeholder="Enter your real name"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-muted block mb-2 px-1">In-Game Name</label>
                                <input 
                                    type="text" 
                                    className="dash-input w-full"
                                    value={editData.gameName}
                                    onChange={(e) => setEditData({...editData, gameName: e.target.value})}
                                    placeholder="Enter your FF nickname"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-muted block mb-2 px-1">Free Fire UID</label>
                                <input 
                                    type="text" 
                                    className="dash-input w-full font-mono"
                                    value={editData.freeFireUID}
                                    onChange={(e) => setEditData({...editData, freeFireUID: e.target.value})}
                                    placeholder="Enter your 8-10 digit UID"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-muted block mb-2 px-1">Phone Number</label>
                                <input 
                                    type="text" 
                                    className="dash-input w-full"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                    placeholder="For prize distribution"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline flex-1">Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
