import React, { useState } from 'react';
import { LayoutDashboard, Users as UsersIcon, Swords, Trophy, DollarSign, Settings, Plus, Search, Edit2, Trash2, XCircle, Play, Square, Key, Award, CheckCircle, X, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CreateTournamentModal from '../components/CreateTournamentModal';
import './AdminPanel.css';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const {
        tournaments,
        deleteTournament,
        users,
        deleteUser,
        toggleUserStatus,
        startMatch,
        endMatch,
        payments,
        uidSubmissions,
        updateRoomDetails,
        approvePayment,
        rejectPayment
    } = useApp();

    const handleSetRoom = (tId) => {
        const roomId = prompt("Enter Room ID:");
        const roomPass = prompt("Enter Room Password:");
        if (roomId && roomPass) {
            updateRoomDetails(tId, roomId, roomPass);
            alert("Room details updated successfully!");
        }
    };

    // Derived stats from real data
    const stats = [
        { title: "Total Users", value: users.length || "0", icon: <UsersIcon size={24} />, color: "text-primary" },
        { title: "Active Tournaments", value: tournaments.filter(t => t.status === 'upcoming' || t.status === 'live').length || "0", icon: <Swords size={24} />, color: "text-warning" },
        { title: "Matches Completed", value: tournaments.filter(t => t.status === 'completed').length || "0", icon: <Trophy size={24} />, color: "text-success" },
        { title: "Total Payments", value: payments.length || "0", icon: <DollarSign size={24} />, color: "text-secondary" },
    ];

    return (
        <div className="admin-page">
            <div className="admin-layout">
                <aside className="admin-sidebar glass-panel">
                    <div className="admin-brand">
                        <span className="text-gradient font-bold text-xl">Arena Admin</span>
                    </div>
                    <nav className="admin-nav">
                        <button className={`admin-nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                            <LayoutDashboard size={18} /> Overview
                        </button>
                        <button className={`admin-nav-link ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>
                            <Swords size={18} /> Tournaments
                        </button>
                        <button className={`admin-nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                            <UsersIcon size={18} /> Users
                        </button>
                        <button className={`admin-nav-link ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
                            <DollarSign size={18} /> Payments
                        </button>
                        <button className={`admin-nav-link ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
                            <Key size={18} /> UID Submissions
                        </button>
                    </nav>
                </aside>

                <main className="admin-content">
                    <div className="admin-header glass-panel mb-4">
                        <h2 className="admin-title text-capitalize">{activeTab} Management</h2>
                        <div className="admin-profile">
                            <span className="text-muted mr-3">Super Admin</span>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="Admin" className="admin-avatar" />
                        </div>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="admin-tab fade-in">
                            <div className="stats-grid mb-5">
                                {stats.map((s, i) => (
                                    <div key={i} className="admin-stat-card glass-panel">
                                        <div className="stat-header">
                                            <span className="text-muted text-sm text-uppercase">{s.title}</span>
                                            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                                        </div>
                                        <div className="stat-value">{s.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'tournaments' && (
                        <div className="admin-tab fade-in">
                            <div className="d-flex justify-between align-center mb-4">
                                <div className="search-box">
                                    <Search size={18} className="search-icon" />
                                    <input type="text" placeholder="Search tournaments..." />
                                </div>
                                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={18} /> Create Tournament
                                </button>
                            </div>

                            <div className="glass-panel admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Players</th>
                                            <th>Registration</th>
                                            <th>Room Details</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournaments.map(t => (
                                            <tr key={t.id}>
                                                <td className="font-bold">{t.name}</td>
                                                <td>
                                                    <span className={`status-badge ${t.status?.toLowerCase()}`}>{t.status}</span>
                                                </td>
                                                <td>{t.players}/{t.maxPlayers || 48}</td>
                                                <td>{t.matchDate} @ {t.exactTime || t.time}</td>
                                                <td className="text-sm">
                                                    {t.roomId ? <span className="text-success">ID: {t.roomId}</span> : <span className="text-muted">Not Set</span>}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button className="btn-link text-success" onClick={() => startMatch(t.id)} title="Start Match"><Play size={16} /></button>
                                                        <button className="btn-link text-warning" onClick={() => handleSetRoom(t.id)} title="Set Room Credentials"><Key size={16} /></button>
                                                        <button className="btn-link text-danger" onClick={() => endMatch(t.id)} title="End Match"><Square size={16} /></button>
                                                        <button className="btn-link text-muted" onClick={() => { if (window.confirm('Delete?')) deleteTournament(t.id) }}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="admin-tab fade-in">
                            <div className="glass-panel admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>FF UID</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td className="font-bold">{u.username || u.name}</td>
                                                <td>{u.freeFireUID || u.ffUid || 'N/A'}</td>
                                                <td>{u.role || 'Player'}</td>
                                                <td><span className={`status-badge ${u.status === 'Active' ? 'success' : 'danger'}`}>{u.status || 'Active'}</span></td>
                                                <td>
                                                    <button className="btn-link text-danger mr-2" onClick={() => toggleUserStatus(u.id, u.status || 'Active')}><XCircle size={16} /></button>
                                                    <button className="btn-link text-muted" onClick={() => deleteUser(u.id)}><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="admin-tab fade-in">
                            <div className="glass-panel admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Tournament</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Proof</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.username}</td>
                                                <td>{tournaments.find(t => t.id === p.tournamentId)?.name || 'Unknown'}</td>
                                                <td>{p.amount}</td>
                                                <td><span className={`status-badge ${p.status?.toLowerCase()}`}>{p.status}</span></td>
                                                <td><button className="btn btn-outline btn-sm"><Eye size={14} className="mr-1" /> View</button></td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button className="btn-link text-success" onClick={() => approvePayment(p.id, p.tournamentId, p.userId)}><CheckCircle size={18} /></button>
                                                        <button className="btn-link text-danger" onClick={() => rejectPayment(p.id)}><X size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'submissions' && (
                        <div className="admin-tab fade-in">
                            <div className="glass-panel admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User ID</th>
                                            <th>Free Fire UID</th>
                                            <th>Tournament</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uidSubmissions.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.userId}</td>
                                                <td className="text-gradient font-bold">{s.freeFireUID}</td>
                                                <td>{tournaments.find(t => t.id === s.tournamentId)?.name || 'Unknown'}</td>
                                                <td>{new Date(s.submitTime).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {showCreateModal && <CreateTournamentModal onClose={() => setShowCreateModal(false)} />}
        </div>
    );
};

export default AdminPanel;
