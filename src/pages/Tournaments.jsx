import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CreateTournamentModal from '../components/CreateTournamentModal';
import CountdownTimer from '../components/CountdownTimer';
import './Tournaments.css';

const Tournaments = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { tournaments } = useApp();

    const filteredTournaments = activeTab === 'all'
        ? tournaments
        : tournaments.filter(t => t.status === activeTab);

    return (
        <div className="tournaments-page">
            <div className="page-header">
                <div className="container">
                    <h1 className="page-title">Battle <span className="text-gradient">Tournaments</span></h1>
                    <p className="page-subtitle">Join the most competitive Free Fire tournaments and win huge daily cash prizes.</p>
                </div>
            </div>

            <div className="container content-section">
                <div className="filters-bar glass-panel">
                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Matches
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
                            onClick={() => setActiveTab('live')}
                        >
                            Live Now
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('completed')}
                        >
                            Completed
                        </button>
                    </div>

                    <div className="search-filter">
                        <div className="search-box">
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Search tournaments..." />
                        </div>
                        <button className="btn btn-outline btn-icon" style={{ marginRight: '10px' }}>
                            <Filter size={18} />
                        </button>
                        {/* Assuming this page is public, let's just make it available if we want admins to use it here. */}
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={18} /> Create Tournament
                        </button>
                    </div>
                </div>

                <div className="tournaments-grid">
                    {filteredTournaments.length === 0 ? (
                        <div className="text-center p-5 glass-panel w-100" style={{ gridColumn: '1 / -1' }}>
                            <h3 className="text-muted">No tournaments available. Check back later.</h3>
                        </div>
                    ) : (
                        filteredTournaments.map(t => (
                            <div key={t.id} className="tournament-card glass-panel">
                                <div className="card-header">
                                    <span className={`status-badge ${t.status}`}>
                                        {t.status === 'live' && <span className="live-dot"></span>}
                                        {t.status === 'live' ? 'Live Now' : t.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                                    </span>
                                    <span className="mode-badge">{t.mode}</span>
                                </div>
                                <div className="card-body">
                                    <h3 className="tournament-name">{t.name}</h3>
                                    <div className="tournament-schedule text-sm text-muted mb-3 mt-2">
                                        <p>📅 {t.date} | ⏰ {t.exactTime || t.time}</p>
                                    </div>
                                    <div className="mb-3 mt-2">
                                        {(t.status === 'live' || t.status === 'upcoming') && (
                                            <CountdownTimer dateStr={t.date} timeStr={t.exactTime || t.time} />
                                        )}
                                    </div>
                                    <div className="tournament-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">Prize Pool</span>
                                            <span className="meta-value text-gradient">{t.prize}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">Entry Fee</span>
                                            <span className="meta-value">{t.entry}</span>
                                        </div>
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress-labels">
                                            <span>Players Joined</span>
                                            <span>{t.players} / {t.maxPlayers}</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${(t.players / t.maxPlayers) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    {t.status === 'completed' ? (
                                        <Link to={`/tournament/${t.id}/results`} className="btn btn-outline w-100">
                                            View Results
                                        </Link>
                                    ) : (
                                        <Link to={`/tournament/${t.id}`} className="btn btn-primary w-100">
                                            Join Match
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showCreateModal && <CreateTournamentModal onClose={() => setShowCreateModal(false)} />}
        </div>
    );
};

export default Tournaments;
