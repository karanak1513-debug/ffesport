import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Trophy, Shield, Users, Clock, Map as MapIcon, ArrowLeft, Target, DollarSign, Group, Calendar, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import JoinBattleModal from '../components/JoinBattleModal';
import MatchRoomModal from '../components/MatchRoomModal';
import ResultsModal from '../components/ResultsModal';
import { AnimatePresence, motion } from 'framer-motion';
import './TournamentDetails.css';

const TournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [matchRoomTournament, setMatchRoomTournament] = useState(null);
    const [resultsTournament, setResultsTournament] = useState(null);
    
    const { currentUser } = useAuth();
    const { tournaments, tournamentPlayers } = useApp();

    const tournament = tournaments?.find(t => String(t?.id) === String(id));
    const myRecord = tournamentPlayers?.find(p => String(p?.tournamentId) === String(id) && p?.userId === currentUser?.uid);

    if (!tournament) {
        return (
            <div className="container py-20 text-center">
                <h2>Tournament Not Found</h2>
                <Link to="/tournaments" className="btn btn-secondary mt-4">Back to Tournaments</Link>
            </div>
        );
    }

    const slotsLeft = Math.max(0, (tournament.maxPlayers || 48) - (tournament.players || 0));

    return (
        <div className="tournament-details-page">
            <div className="details-header">
                <div className="container">
                    <Link to="/tournaments" className="back-btn"><ArrowLeft size={18} /> Back</Link>
                    <div className="header-flex">
                        <div className="header-info">
                            <div className="status-row">
                                <span className={`badge badge-${tournament.status?.toLowerCase()}`}>{tournament.status?.toUpperCase()}</span>
                                <span className="type-tag">{tournament.type || 'CLASSIC'}</span>
                            </div>
                            <h1 className="tournament-title">{tournament.name}</h1>
                        </div>
                        <div className="header-prize">
                            <span className="prize-label">Total Prize Pool</span>
                            <h2 className="prize-value">₹{tournament.prizePool || tournament.prize || '0'}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-10">
                <div className="details-grid">
                    <div className="main-content">
                        {/* Info Blocks */}
                        <div className="info-blocks-grid">
                            <div className="info-block">
                                <div className="block-icon"><Calendar size={24} /></div>
                                <div className="block-data">
                                    <span className="block-label">Match Date</span>
                                    <span className="block-value">{tournament.date || 'TBA'}</span>
                                </div>
                            </div>
                            <div className="info-block">
                                <div className="block-icon"><Clock size={24} /></div>
                                <div className="block-data">
                                    <span className="block-label">Match Time</span>
                                    <span className="block-value">{tournament.matchTime || tournament.exactTime || 'TBA'}</span>
                                </div>
                            </div>
                            <div className="info-block">
                                <div className="block-icon"><MapIcon size={24} /></div>
                                <div className="block-data">
                                    <span className="block-label">Map</span>
                                    <span className="block-value">{tournament.map || 'Bermuda'}</span>
                                </div>
                            </div>
                            <div className="info-block">
                                <div className="block-icon"><Target size={24} /></div>
                                <div className="block-data">
                                    <span className="block-label">Mode</span>
                                    <span className="block-value">{tournament.mode || 'SOLO'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description / Rules */}
                        <div className="glass-panel p-6 mb-6">
                            <h3 className="panel-title"><Shield size={20} /> Match Rules</h3>
                            <ul className="rules-list">
                                <li>Mobile players only. Emulator players will be banned.</li>
                                <li>Join the room at least 10 minutes before the start time.</li>
                                <li>Teaming/Cheating will result in permanent ban and no prize.</li>
                                <li>Room ID and Password will be shared here for approved players.</li>
                            </ul>
                        </div>

                        {/* Prize Distribution */}
                        <div className="glass-panel p-6">
                            <h3 className="panel-title"><Trophy size={20} /> Prize Distribution</h3>
                            <div className="prize-dist-grid">
                                <div className="prize-row gold">
                                    <span>1st Place</span>
                                    <span>₹{(tournament.prizePool * 0.5) || (tournament.prize * 0.5) || '0'}</span>
                                </div>
                                <div className="prize-row silver">
                                    <span>2nd Place</span>
                                    <span>₹{(tournament.prizePool * 0.25) || (tournament.prize * 0.25) || '0'}</span>
                                </div>
                                <div className="prize-row bronze">
                                    <span>3rd Place</span>
                                    <span>₹{(tournament.prizePool * 0.15) || (tournament.prize * 0.15) || '0'}</span>
                                </div>
                                <div className="prize-row kills">
                                    <span>Per Kill</span>
                                    <span>₹{(tournament.perKill || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-content">
                        <div className="join-sidebar-card">
                            <div className="fee-section">
                                <span className="fee-label">ENTRY FEE</span>
                                <h2 className="fee-value">₹{tournament.entryFee || tournament.entry || 'Free'}</h2>
                            </div>

                            <div className="slots-section">
                                <div className="slots-header">
                                    <span>{tournament.players || 0} / {tournament.maxPlayers || 48} Players Joined</span>
                                    <span className="slots-left">{slotsLeft} Slots Left</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${Math.min(100, ((tournament.players || 0) / (tournament.maxPlayers || 48)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {myRecord ? (
                                <div className="enrollment-status">
                                    <div className={`status-banner ${myRecord.status?.toLowerCase()}`}>
                                        <Info size={18} />
                                        <span>Status: {myRecord.status?.toUpperCase()}</span>
                                    </div>
                                    <p className="status-note">
                                        {myRecord.status === 'approved' 
                                            ? "You're approved! Access the room details when the match is live." 
                                            : "Your request is pending. Wait for admin approval."}
                                    </p>
                                    {myRecord.status === 'approved' && (
                                        <button onClick={() => setMatchRoomTournament(tournament)} className="btn btn-primary w-100 mt-4">
                                            Enter Match Room
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button 
                                    className="btn btn-primary btn-lg w-100 mt-6"
                                    onClick={() => setShowJoinModal(true)}
                                    disabled={slotsLeft === 0 || tournament.status !== 'open'}
                                >
                                    {slotsLeft === 0 ? 'Tournament Full' : 'Join Tournament'}
                                </button>
                            )}

                            {tournament.status === 'completed' && (
                                <button onClick={() => setResultsTournament(tournament)} className="btn btn-secondary w-100 mt-4">
                                    View Tournament Results
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showJoinModal && (
                    <JoinBattleModal 
                        tournament={tournament} 
                        onClose={() => setShowJoinModal(false)}
                    />
                )}
                {matchRoomTournament && (
                    <MatchRoomModal 
                        tournament={matchRoomTournament} 
                        onClose={() => setMatchRoomTournament(null)}
                    />
                )}
                {resultsTournament && (
                    <ResultsModal
                        tournament={resultsTournament}
                        onClose={() => setResultsTournament(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TournamentDetails;
