import React, { useState, useMemo } from 'react';
import {
    LayoutDashboard, Swords, Users, Clock, CheckCircle, XCircle,
    Plus, Key, Download, Eye, Search, Send, Play, Square,
    Trash2, Trophy, Shield, LogOut, Layout, List, Edit3, Wallet, TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import CreateTournamentModal from '../components/CreateTournamentModal';
import EditTournamentModal from '../components/EditTournamentModal';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminPanel.css';
import './CreatorPanel.css';

const CreatorPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editTournament, setEditTournament] = useState(null);
    const [tournamentSearch, setTournamentSearch] = useState('');
    const [roomModal, setRoomModal] = useState(null);
    const [roomInput, setRoomInput] = useState({ roomId: '', roomPass: '' });

    const { currentUser, userData, logout, isCreator, isAdmin } = useAuth();
    const {
        tournaments, tournamentPlayers,
        approvePlayer, rejectPlayer, removePlayer,
        startMatch, endMatch, deleteTournament,
        updateRoomDetails, publishRoomDetails
    } = useApp();
    const navigate = useNavigate();

    const myTournaments = useMemo(() => tournaments.filter(t => t.createdBy === currentUser?.uid), [tournaments, currentUser]);
    
    // Calculate Creator Stats & Profit (20% share of total collection)
    const stats = useMemo(() => {
        let totalJoins = 0;
        let totalCollection = 0;
        
        myTournaments.forEach(t => {
            const approvedCount = tournamentPlayers.filter(p => String(p.tournamentId) === String(t.id) && p.status === 'approved').length;
            totalJoins += approvedCount;
            totalCollection += approvedCount * (Number(t.entryFee || t.entry || 0));
        });

        const myProfit = (totalCollection || 0) * 0.20;

        return {
            totalTournaments: myTournaments.length,
            totalJoins,
            totalCollection: totalCollection || 0,
            myProfit: myProfit || 0,
            pendingApprovals: tournamentPlayers.filter(p => 
                myTournaments.some(t => t.id === p.tournamentId) && p.status === 'pending'
            ).length
        };
    }, [myTournaments, tournamentPlayers]);

    if (!isCreator && !isAdmin) return <div className="container py-20 text-center"><h2>Access Denied</h2></div>;

    return (
        <div className="admin-page">
            <div className="admin-sidebar">
                <div className="sidebar-brand">
                    <Swords className="text-primary" />
                    <span>MY PANEL</span>
                </div>
                <nav className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button className={`nav-btn ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>
                        <Swords size={18} /> My Tournaments
                    </button>
                    <button className={`nav-btn ${activeTab === 'players' ? 'active' : ''}`} onClick={() => setActiveTab('players')}>
                        <Users size={18} /> Player Requests
                    </button>
                </nav>
                <div className="mt-auto p-4 border-t border-white/5">
                    <button className="nav-btn w-100 text-danger" onClick={logout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            <main className="admin-main">
                <header className="admin-header">
                    <h2 className="text-capitalize">{activeTab}</h2>
                    <div className="creator-profit-tag">
                        <Wallet size={16} className="text-success" />
                        <span>Profit: <strong>₹{stats.myProfit.toLocaleString()}</strong></span>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-view">
                            <div className="admin-stats-grid">
                                <div className="stat-card border-orange">
                                    <div className="stat-info">
                                        <span className="stat-label">Total Tournaments</span>
                                        <span className="stat-value">{stats.totalTournaments}</span>
                                    </div>
                                    <div className="stat-icon-box bg-orange"><Swords size={20} /></div>
                                </div>
                                <div className="stat-card border-blue">
                                    <div className="stat-info">
                                        <span className="stat-label">Total Joins</span>
                                        <span className="stat-value">{stats.totalJoins}</span>
                                    </div>
                                    <div className="stat-icon-box bg-blue"><Users size={20} /></div>
                                </div>
                                <div className="stat-card border-yellow">
                                    <div className="stat-info">
                                        <span className="stat-label">Pending Approvals</span>
                                        <span className="stat-value">{stats.pendingApprovals}</span>
                                    </div>
                                    <div className="stat-icon-box bg-yellow"><Clock size={20} /></div>
                                </div>
                                <div className="stat-card border-green">
                                    <div className="stat-info">
                                        <span className="stat-label">My Profit (20%)</span>
                                        <span className="stat-value">₹{stats.myProfit.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-icon-box bg-green"><TrendingUp size={20} /></div>
                                </div>
                            </div>

                            <div className="finance-summary mt-8 glass-panel p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="m-0">Profit & Collection</h3>
                                    <button className="btn btn-primary btn-sm py-2 px-6" onClick={() => alert("Withdrawal request sent to admin!")}>Withdraw Profit</button>
                                </div>
                                <div className="finance-grid">
                                    <div className="fin-card">
                                        <span>Total Collection</span>
                                        <h4 className="text-white">₹{stats.totalCollection.toLocaleString()}</h4>
                                    </div>
                                    <div className="fin-card">
                                        <span>Deduction (Admin Share)</span>
                                        <h4 className="text-muted">₹{(stats.totalCollection * 0.8).toLocaleString()}</h4>
                                    </div>
                                    <div className="fin-card">
                                        <span>Final Payout</span>
                                        <h4 className="text-primary">₹{stats.myProfit.toLocaleString()}</h4>
                                    </div>
                                </div>
                                <p className="text-xs text-muted mt-6 italic">* Note: Creator profit is 20% of the total collection from approved tournament entries.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tournaments' && (
                        <div className="tournaments-view">
                            <div className="view-header">
                                <div className="search-bar">
                                    <Search size={18} />
                                    <input type="text" placeholder="Search my tournaments..." value={tournamentSearch} onChange={e => setTournamentSearch(e.target.value)} />
                                </div>
                                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={18} /> Host Tournament
                                </button>
                            </div>
                            
                            <div className="admin-table-wrapper mt-6">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Match Name</th>
                                            <th>Status</th>
                                            <th>Joins</th>
                                            <th>Collection</th>
                                            <th>My Profit</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myTournaments.filter(t => t.name.toLowerCase().includes(tournamentSearch.toLowerCase())).map(t => {
                                            const joined = tournamentPlayers.filter(p => String(p.tournamentId) === String(t.id) && p.status === 'approved').length;
                                            const collection = joined * (Number(t.entryFee || t.entry || 0));
                                            const profit = collection * 0.20;
                                            return (
                                                <tr key={t.id}>
                                                    <td className="font-bold">{t.name}</td>
                                                    <td><span className={`badge badge-${t.status?.toLowerCase()}`}>{t.status}</span></td>
                                                    <td>{joined}/{t.maxPlayers || 48}</td>
                                                    <td className="text-muted">₹{(collection || 0).toLocaleString()}</td>
                                                    <td className="text-primary font-bold">₹{(profit || 0).toLocaleString()}</td>
                                                    <td>
                                                        <div className="action-btns">
                                                            {t.status === 'live' ? (
                                                                <button className="btn-action stop" onClick={() => endMatch(t.id)}>End</button>
                                                            ) : (
                                                                <button className="btn-action start" onClick={() => startMatch(t.id, t.status)} disabled={t.status === 'completed'}>Start</button>
                                                            )}
                                                            <button className="btn-action room" onClick={() => setRoomModal(t)}>Room</button>
                                                            <button className="btn-action start" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff' }} onClick={() => setEditTournament(t)}>Edit</button>
                                                            <button className="btn-action delete" onClick={() => deleteTournament(t.id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'players' && (
                        <div className="players-view">
                            <div className="admin-table-wrapper mt-6">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th>Tournament</th>
                                            <th>UTR / Transaction</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournamentPlayers.filter(p => myTournaments.some(t => t.id === p.tournamentId)).map(p => (
                                            <tr key={p.id}>
                                                <td>{p.playerName} <br/> <small className="text-muted">{p.ffuid}</small></td>
                                                <td>{myTournaments.find(t => t.id === p.tournamentId)?.name}</td>
                                                <td className="font-mono text-xs text-primary">{p.utrNumber || p.transactionId || 'N/A'}</td>
                                                <td><span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span></td>
                                                <td>
                                                    <div className="action-btns">
                                                        {p.status === 'pending' && <button className="btn-action approve" onClick={() => approvePlayer(p.id, p.tournamentId)}>Approve</button>}
                                                        {p.status === 'pending' && <button className="btn-action reject" onClick={() => rejectPlayer(p.id, p.tournamentId, p.status)}>Reject</button>}
                                                        <button className="btn-action delete" onClick={() => removePlayer(p.id)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Reuse Modals from Admin */}
            <AnimatePresence>
                {showCreateModal && <CreateTournamentModal onClose={() => setShowCreateModal(false)} />}
                {editTournament && <EditTournamentModal tournament={editTournament} onClose={() => setEditTournament(null)} />}
                {roomModal && (
                    <div className="modal-overlay">
                        <div className="modal-card p-8">
                             <h3>Match Room Details</h3>
                             <p className="text-muted mb-6">Enter Room ID & Password for {roomModal.name}</p>
                             <div className="form-group mb-4">
                                 <label>ROOM ID</label>
                                 <input className="simple-input" type="text" value={roomInput.roomId} onChange={e => setRoomInput({...roomInput, roomId: e.target.value})} />
                             </div>
                             <div className="form-group mb-6">
                                 <label>PASSWORD</label>
                                 <input className="simple-input" type="text" value={roomInput.roomPass} onChange={e => setRoomInput({...roomInput, roomPass: e.target.value})} />
                             </div>
                             <div className="flex gap-4">
                                 <button className="btn btn-secondary flex-1" onClick={() => setRoomModal(null)}>Cancel</button>
                                 <button className="btn btn-primary flex-1" onClick={async () => {
                                     await updateRoomDetails(roomModal.id, roomInput.roomId, roomInput.roomPass);
                                     setRoomModal(null);
                                 }}>Save Info</button>
                             </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreatorPanel;
