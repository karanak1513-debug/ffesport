import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users as UsersIcon, Swords, Trophy, 
    DollarSign, Plus, Search, Trash2, Play, Square, Key, 
    CheckCircle, X, Shield, Download, Clock, AlertCircle, TrendingUp, Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import CreateTournamentModal from '../components/CreateTournamentModal';
import './AdminPanel.css';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [playerSearch, setPlayerSearch] = useState('');
    const [playerFilter, setPlayerFilter] = useState('all');
    const [loadingAction, setLoadingAction] = useState(null);
    const [toast, setToast] = useState(null);
    const [roomModal, setRoomModal] = useState(null);
    const [roomInput, setRoomInput] = useState({ roomId: '', roomPass: '' });
    const [resultsModal, setResultsModal] = useState(null);
    const [winnersData, setWinnersData] = useState({ first: '', second: '', third: '' });

    const {
        tournaments, deleteTournament, users, startMatch, endMatch,
        tournamentPlayers, updateRoomDetails, publishRoomDetails,
        approvePlayer, rejectPlayer, removePlayer, toggleUserStatus
    } = useApp();

    const { userData, isAdmin: isAdminFromAuth } = useAuth();
    const isAdmin = isAdminFromAuth || userData?.role === 'admin';

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- Stats Calculations ---
    const totalTransactions = tournamentPlayers.filter(p => p.status === 'approved');
    const totalRevenue = tournaments.reduce((acc, t) => {
        const approvedCount = tournamentPlayers.filter(p => String(p.tournamentId) === String(t.id) && p.status === 'approved').length;
        return acc + (Number(t.entryFee || t.entry || 0) * approvedCount);
    }, 0);
    
    const totalPrizeDistributed = tournaments.filter(t => t.status === 'completed').reduce((acc, t) => {
        return acc + (Number(t.prizePool || t.prize || 0));
    }, 0);

    const totalProfit = totalRevenue - totalPrizeDistributed;

    const stats = [
        { title: "Total Tournaments", value: tournaments.length, icon: <Swords size={20} />, color: "orange" },
        { title: "Total Players", value: users.length, icon: <UsersIcon size={20} />, color: "blue" },
        { title: "Pending Requests", value: tournamentPlayers.filter(p => p.status === 'pending').length, icon: <Clock size={20} />, color: "yellow" },
        { title: "Live Matches", value: tournaments.filter(t => t.status === 'live').length, icon: <Play size={20} />, color: "red" },
        { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: "green" },
        { title: "Total Profit", value: `₹${totalProfit.toLocaleString()}`, icon: <TrendingUp size={20} />, color: "cyan" },
    ];

    if (!isAdmin) return <div className="container py-20 text-center"><h2>Access Denied</h2></div>;

    return (
        <div className="admin-page">
            <div className="admin-sidebar">
                <div className="sidebar-brand">
                    <Shield className="text-primary" />
                    <span>ARENA ADMIN</span>
                </div>
                <nav className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button className={`nav-btn ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>
                        <Swords size={18} /> Tournaments
                    </button>
                    <button className={`nav-btn ${activeTab === 'players' ? 'active' : ''}`} onClick={() => setActiveTab('players')}>
                        <UsersIcon size={18} /> Player Requests
                    </button>
                    <button className={`nav-btn ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
                        <Trophy size={18} /> Match Results
                    </button>
                    <button className={`nav-btn ${activeTab === 'creators' ? 'active' : ''}`} onClick={() => setActiveTab('creators')}>
                        <Shield size={18} /> Creators
                    </button>
                </nav>
            </div>

            <main className="admin-main">
                <header className="admin-header">
                    <h2 className="text-capitalize">{activeTab}</h2>
                    <div className="admin-user">
                        <span>{userData?.username || 'Admin'}</span>
                        <div className="admin-avatar-mini">A</div>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-view">
                            <div className="admin-stats-grid">
                                {stats.map((s, i) => (
                                    <div key={i} className={`stat-card border-${s.color}`}>
                                        <div className="stat-info">
                                            <span className="stat-label">{s.title}</span>
                                            <span className="stat-value">{s.value}</span>
                                        </div>
                                        <div className={`stat-icon-box bg-${s.color}`}>
                                            {s.icon}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="finance-summary mt-8 glass-panel p-6">
                                <h3 className="mb-4">Financial Overview</h3>
                                <div className="finance-grid">
                                    <div className="fin-card">
                                        <span>Total Revenue</span>
                                        <h4 className="text-success">₹{totalRevenue.toLocaleString()}</h4>
                                    </div>
                                    <div className="fin-card">
                                        <span>Total Prize Distributed</span>
                                        <h4 className="text-warning">₹{totalPrizeDistributed.toLocaleString()}</h4>
                                    </div>
                                    <div className="fin-card">
                                        <span>Total Admin Profit</span>
                                        <h4 className="text-primary">₹{totalProfit.toLocaleString()}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tournaments' && (
                        <div className="tournaments-view">
                            <div className="view-header">
                                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={18} /> Create New
                                </button>
                            </div>
                            <div className="admin-table-wrapper card mt-6">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Tournament Name</th>
                                            <th>Status</th>
                                            <th>Players</th>
                                            <th>Match Time</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournaments.map(t => (
                                            <tr key={t.id}>
                                                <td className="font-bold">{t.name}</td>
                                                <td><span className={`badge badge-${t.status?.toLowerCase()}`}>{t.status}</span></td>
                                                <td>{t.players}/{t.maxPlayers || 48}</td>
                                                <td className="text-muted">{t.date} @ {t.matchTime || t.exactTime}</td>
                                                <td>
                                                    <div className="action-btns">
                                                        {t.status === 'open' && (
                                                            <button className="btn-action start" onClick={() => startMatch(t.id, t.status)}>Start Match</button>
                                                        )}
                                                        <button className="btn-action room" onClick={() => setRoomModal(t)}>Add Room</button>
                                                        {t.roomId && !t.roomPublished && (
                                                            <button className="btn-action publish" onClick={() => publishRoomDetails(t.id)}>Publish Room</button>
                                                        )}
                                                        {t.status === 'live' && (
                                                            <button className="btn-action stop" onClick={() => setResultsModal(t)}>End Match</button>
                                                        )}
                                                        <button className="btn-action delete" onClick={() => deleteTournament(t.id)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'players' && (
                        <div className="players-view">
                            <div className="view-header">
                                <div className="search-bar">
                                    <Search size={18} />
                                    <input type="text" placeholder="Search by name or UID..." value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="admin-table-wrapper card mt-6">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th>FF UID</th>
                                            <th>Tournament</th>
                                            <th>UTR ID</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournamentPlayers.filter(p => 
                                            p.playerName?.toLowerCase().includes(playerSearch.toLowerCase()) || 
                                            p.ffuid?.includes(playerSearch)
                                        ).map(p => (
                                            <tr key={p.id}>
                                                <td>{p.playerName}</td>
                                                <td className="text-secondary">{p.ffuid}</td>
                                                <td>{tournaments.find(t => t.id === p.tournamentId)?.name || 'Deleted'}</td>
                                                <td className="font-mono text-xs">{p.utrNumber || p.transactionId || 'N/A'}</td>
                                                <td><span className={`badge badge-${p.status?.toLowerCase()}`}>{p.status}</span></td>
                                                <td>
                                                    <div className="action-btns">
                                                        {p.status === 'pending' && (
                                                            <button className="btn-action approve" onClick={() => approvePlayer(p.id, p.tournamentId)}>Approve</button>
                                                        )}
                                                        {p.status === 'pending' && (
                                                            <button className="btn-action reject" onClick={() => rejectPlayer(p.id, p.tournamentId, p.status)}>Reject</button>
                                                        )}
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

                    {activeTab === 'results' && (
                         <div className="results-view">
                             <div className="admin-table-wrapper card">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Tournament</th>
                                            <th>Winner</th>
                                            <th>Kills</th>
                                            <th>Points</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournaments.filter(t => t.status === 'completed').map(t => (
                                            <tr key={t.id}>
                                                <td>{t.name}</td>
                                                <td className="text-success font-bold">{t.winners?.first || 'N/A'}</td>
                                                <td>{t.winners?.kills || '0'}</td>
                                                <td>{t.winners?.points || '0'}</td>
                                                <td>
                                                    <button className="btn-action room" onClick={() => setResultsModal(t)}>Edit Results</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                         </div>
                    )}

                     {activeTab === 'creators' && (
                         <div className="creators-view">
                             <div className="admin-table-wrapper card">
                                 <table className="admin-table">
                                     <thead>
                                         <tr>
                                             <th>Creator</th>
                                             <th>Email</th>
                                             <th>Joined</th>
                                             <th>Status</th>
                                             <th>Actions</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {users.filter(u => u.role === 'creator').map(u => (
                                             <tr key={u.id}>
                                                 <td>
                                                     <div className="flex items-center gap-3">
                                                         {u.profilePhoto ? (
                                                            <img src={u.profilePhoto} alt="" className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                                                         ) : (
                                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                                                <Shield size={20} />
                                                            </div>
                                                         )}
                                                         <span className="font-bold text-lg">{u.username || 'Anonymous'}</span>
                                                     </div>
                                                 </td>
                                                 <td className="text-muted">{u.email}</td>
                                                 <td className="text-muted">
                                                     {u.createdAt?.seconds 
                                                         ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() 
                                                         : u.joinedAt?.seconds 
                                                             ? new Date(u.joinedAt.seconds * 1000).toLocaleDateString()
                                                             : 'Recently'}
                                                 </td>
                                                 <td>
                                                     <span className={`badge badge-${u.status?.toLowerCase() || 'active'}`}>
                                                         {u.status || 'Active'}
                                                     </span>
                                                 </td>
                                                 <td>
                                                     <div className="action-btns">
                                                         {u.status?.toLowerCase() !== 'suspended' ? (
                                                             <button 
                                                                 className="btn-action stop" 
                                                                 onClick={async () => {
                                                                     const res = await toggleUserStatus(u.id, u.status?.toLowerCase());
                                                                     if (res.success) {
                                                                         showToast("Creator suspended");
                                                                     } else {
                                                                         showToast(res.error || "Failed to suspend", "error");
                                                                     }
                                                                 }}
                                                             >
                                                                 Suspend
                                                             </button>
                                                         ) : (
                                                             <button 
                                                                 className="btn-action start" 
                                                                 onClick={async () => {
                                                                     const res = await toggleUserStatus(u.id, u.status?.toLowerCase());
                                                                     if (res.success) {
                                                                         showToast("Creator activated");
                                                                     } else {
                                                                         showToast(res.error || "Failed to activate", "error");
                                                                     }
                                                                 }}
                                                             >
                                                                 Activate
                                                             </button>
                                                         )}
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

            {/* Modals */}
            <AnimatePresence>
                {showCreateModal && <CreateTournamentModal onClose={() => setShowCreateModal(false)} />}
                
                {roomModal && (
                    <div className="modal-overlay">
                        <div className="modal-card p-6">
                            <h3>Room Details - {roomModal.name}</h3>
                            <div className="form-group mt-4">
                                <label>ROOM ID</label>
                                <input className="simple-input" type="text" value={roomInput.roomId} onChange={(e) => setRoomInput({...roomInput, roomId:e.target.value})} />
                            </div>
                            <div className="form-group mt-4">
                                <label>PASSWORD</label>
                                <input className="simple-input" type="text" value={roomInput.roomPass} onChange={(e) => setRoomInput({...roomInput, roomPass:e.target.value})} />
                            </div>
                            <div className="btn-group mt-6">
                                <button className="btn btn-secondary" onClick={() => setRoomModal(null)}>Cancel</button>
                                <button className="btn btn-primary" onClick={async () => {
                                    await updateRoomDetails(roomModal.id, roomInput.roomId, roomInput.roomPass);
                                    setRoomModal(null);
                                    showToast("Room details updated");
                                }}>Save Details</button>
                            </div>
                        </div>
                    </div>
                )}

                {resultsModal && (
                    <div className="modal-overlay">
                        <div className="modal-card p-6">
                            <h3>Match Results - {resultsModal.name}</h3>
                            <div className="form-group mt-4">
                                <label>1ST PLACE WINNER</label>
                                <select className="simple-input" value={winnersData.first} onChange={(e) => setWinnersData({...winnersData, first:e.target.value})}>
                                    <option value="">Select Champion</option>
                                    {tournamentPlayers.filter(p => String(p.tournamentId) === String(resultsModal.id) && p.status === 'approved').map(p => (
                                        <option key={p.id} value={p.playerName}>{p.playerName} ({p.ffuid})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="form-group">
                                    <label>TOTAL KILLS</label>
                                    <input className="simple-input" type="number" value={winnersData.kills || ''} onChange={(e) => setWinnersData({...winnersData, kills:e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>TOTAL POINTS</label>
                                    <input className="simple-input" type="number" value={winnersData.points || ''} onChange={(e) => setWinnersData({...winnersData, points:e.target.value})} />
                                </div>
                            </div>
                            <div className="btn-group mt-6">
                                <button className="btn btn-secondary" onClick={() => setResultsModal(null)}>Cancel</button>
                                <button className="btn btn-primary" onClick={async () => {
                                    await endMatch(resultsModal.id, winnersData, resultsModal.status);
                                    setResultsModal(null);
                                    showToast("Match ended & results published");
                                }}>Publish Results</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className={`toast ${toast.type}`}>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
