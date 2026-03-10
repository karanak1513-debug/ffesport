import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, Users, Clock, Map, AlertCircle, ArrowLeft, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CountdownTimer from '../components/CountdownTimer';
import './TournamentDetails.css';

const TournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [joined, setJoined] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [formData, setFormData] = useState({ name: '', ffuid: '', team: '', screenshot: null });

    const { tournaments, joinTournament } = useApp();

    const tournament = tournaments.find(t => String(t.id) === String(id));

    if (!tournament) {
        return <div className="container p-5 text-center"><h2>Tournament not found</h2></div>;
    }

    const activePrizes = tournament.prizes || [
        { rank: "1st Prize", amount: "₹2,500" },
        { rank: "2nd Prize", amount: "₹1,000" },
        { rank: "3rd Prize", amount: "₹500" },
        { rank: "Per Kill", amount: "₹10" },
    ];

    const handleJoinClick = () => {
        setShowPayment(true);
    };

    const handleFormChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleGuestJoinSubmit = async (e) => {
        e.preventDefault();

        const playerData = {
            name: formData.name,
            ffuid: formData.ffuid,
            team: formData.team,
            entryFee: tournament.entry,
            screenshotId: formData.screenshot ? `ss_${Date.now()}` : 'no_file'
        };

        const success = await joinTournament(tournament.id, playerData);
        if (success) {
            setJoined(true);
            setShowPayment(false);
            setTimeout(() => {
                navigate(`/match-room/${tournament.id}`);
            }, 1500);
        } else {
            alert("Error joining. Please try again.");
        }
    };

    return (
        <div className="tournament-details-page">
            <div className="td-banner">
                <div className="td-banner-overlay"></div>
                <div className="container position-relative z-10">
                    <Link to="/tournaments" className="back-link mb-4">
                        <ArrowLeft size={16} /> Back to Tournaments
                    </Link>
                    <div className="td-header-content">
                        <span className={`status-badge ${tournament.status} mb-3`} style={{ display: 'inline-block' }}>{tournament.status}</span>
                        <h1 className="td-title text-gradient">{tournament.name}</h1>
                        <div className="td-meta-row">
                            <span><Clock size={16} /> {tournament.date} at {tournament.exactTime || tournament.time}</span>
                            <span><Map size={16} /> Map: {tournament.map || 'Bermuda'}</span>
                            <span><Users size={16} /> Mode: {tournament.mode}</span>
                        </div>
                        <div className="mt-3">
                            <CountdownTimer dateStr={tournament.date} timeStr={tournament.exactTime || tournament.time} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-neg-50">
                <div className="td-grid">
                    <div className="td-main">
                        <div className="glass-panel p-4 mb-4">
                            <h2 className="section-title text-xl mb-4">Prize Pool Distribution</h2>
                            <div className="prize-grid">
                                <div className="prize-total w-100 mb-4 text-center">
                                    <span className="text-muted text-uppercase text-sm">Total Prize Pool</span>
                                    <h2 className="text-success text-3xl">{tournament.prize || tournament.prizePool}</h2>
                                </div>
                                {activePrizes.map((p, index) => (
                                    <div key={index} className="prize-item">
                                        <span className={`rank-label ${index === 0 ? 'text-warning font-bold' : ''}`}>{p.rank}</span>
                                        <span className="prize-amount text-success font-bold">{p.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel p-4 mb-4 rules-section">
                            <h2 className="section-title text-xl mb-4"><Shield size={20} className="mr-2 text-primary" style={{ verticalAlign: 'middle' }} /> Match & Anti-Cheat Rules</h2>
                            <ul className="rules-list text-muted">
                                <li>Players must join the custom room 10 minutes before start time.</li>
                                {tournament.regCloseTime && (
                                    <li className="text-warning">Registrations strictly close at {tournament.regCloseTime}.</li>
                                )}
                                <li>Teaming up with opponents will lead to an instant permanent ban.</li>
                                <li>The room ID and Password will be shared in the Match Room.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="td-sidebar">
                        <div className="join-card glass-panel sticky-top">
                            <div className="spots-info text-center mb-4">
                                <div className="spots-circle">
                                    <span className="current-spots">{tournament.players || 0}</span>
                                    <span className="slash">/</span>
                                    <span className="total-spots text-muted">{tournament.maxPlayers || 48}</span>
                                </div>
                                <p className="text-muted mt-2">Players Registered</p>
                                <div className="progress-bar mt-3">
                                    <div className="progress-fill" style={{ width: `${((tournament.players || 0) / (tournament.maxPlayers || 48)) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="payment-summary mb-4">
                                <div className="d-flex justify-between mb-2">
                                    <span className="text-muted">Entry Fee</span>
                                    <span className="font-bold">{tournament.entry || tournament.entryFee}</span>
                                </div>
                            </div>

                            {joined ? (
                                <button className="btn btn-success w-100 btn-lg" disabled>
                                    Joined! Redirecting...
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary w-100 btn-lg"
                                    onClick={handleJoinClick}
                                    disabled={(tournament.players || 0) >= (tournament.maxPlayers || 48)}
                                >
                                    Confirm Registration
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Guest Join & Payment Modal */}
            {showPayment && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content glass-panel p-5" style={{ maxWidth: '400px', width: '90%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button className="close-btn" onClick={() => setShowPayment(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>&times;</button>

                        <h2 className="text-xl font-bold mb-2 text-center">Join Tournament</h2>
                        <p className="text-muted mb-4 text-center">Fill in details to participate.</p>

                        <form onSubmit={handleGuestJoinSubmit} className="auth-form" style={{ textAlign: 'left' }}>
                            <div className="form-group mb-3">
                                <label style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px', display: 'block' }}>Player Name *</label>
                                <input type="text" name="name" placeholder="Your Name" required className="w-100 p-2 rounded bg-dark border-secondary text-white" value={formData.name} onChange={handleFormChange} />
                            </div>

                            <div className="form-group mb-3">
                                <label style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px', display: 'block' }}>Free Fire UID *</label>
                                <input type="text" name="ffuid" placeholder="eg. 1234567890" required className="w-100 p-2 rounded bg-dark border-secondary text-white" value={formData.ffuid} onChange={handleFormChange} />
                            </div>

                            <div className="form-group mb-4">
                                <label style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px', display: 'block' }}>Team Name (Optional)</label>
                                <input type="text" name="team" placeholder="Your Squad Name" className="w-100 p-2 rounded bg-dark border-secondary text-white" value={formData.team} onChange={handleFormChange} />
                            </div>

                            <button type="submit" className="btn btn-primary w-100 btn-lg mt-2">
                                Submit Join Request
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentDetails;
