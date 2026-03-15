import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import CreateTournamentModal from '../components/CreateTournamentModal';
import JoinBattleModal from '../components/JoinBattleModal';
import MatchRoomModal from '../components/MatchRoomModal';
import TournamentCard from '../components/TournamentCard';
import ResultsModal from '../components/ResultsModal';
import './Tournaments.css';

const Tournaments = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [matchRoomTournament, setMatchRoomTournament] = useState(null);
    const [resultsTournament, setResultsTournament] = useState(null);
    
    const { tournaments } = useApp();
    const { isAdmin, isCreator, userData } = useAuth();
    const isSuspended = userData?.status?.toLowerCase() === 'suspended';
    const navigate = useNavigate();

    const filteredTournaments = useMemo(() => {
        let list = [...tournaments];
        
        // Filter by Tab
        if (activeTab === 'upcoming') {
            list = list.filter(t => t.status === 'open' || t.status === 'upcoming');
        } else if (activeTab !== 'all') {
            list = list.filter(t => t.status?.toLowerCase() === activeTab);
        }

        // Filter by Search
        if (searchQuery) {
            list = list.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return list;
    }, [tournaments, activeTab, searchQuery]);

    return (
        <div className="tournaments-page">
            <div className="tournament-hero">
                <div className="container relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h1 className="text-4xl lg:text-6xl font-black mb-4">TOURNAMENTS</h1>
                        <p className="text-muted max-w-xl mx-auto mb-8 font-medium">
                            Join competitive Free Fire matches and win rewards.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container pb-20">
                {/* Modern Filter & Search Bar */}
                <div className="controls-bar p-4 mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <div className="tab-filters flex gap-1 overflow-x-auto w-full lg:w-auto">
                        {['all', 'live', 'upcoming', 'completed'].map(tab => (
                            <button
                                key={tab}
                                className={`filter-tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4 w-full lg:w-auto">
                        <div className="modern-search flex-1 lg:w-80">
                            <Search size={18} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search tournament..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {(isAdmin || (isCreator && !isSuspended)) && (
                            <button className="btn-pro primary px-8" onClick={() => setShowCreateModal(true)}>
                                <Plus size={20} /> HOST
                            </button>
                        )}
                    </div>
                </div>

                {/* Tournament List Grid */}
                <div className="tournaments-grid-modern">
                    <AnimatePresence mode="popLayout">
                        {filteredTournaments.length > 0 ? (
                            filteredTournaments.map((t) => (
                                <TournamentCard 
                                    key={t.id} 
                                    t={t} 
                                    onJoin={() => setSelectedTournament(t)}
                                    onDetails={() => navigate(`/tournament/${t.id}`)}
                                    onMatchRoom={() => setMatchRoomTournament(t)}
                                    onResults={() => setResultsTournament(t)}
                                />
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="empty-state-modern col-span-full py-40 text-center"
                            >
                                <div className="empty-icon-box mx-auto mb-8 bg-white/5 border border-white/10">
                                    <Trophy size={48} className="text-muted opacity-30" />
                                </div>
                                <h3 className="text-3xl font-black mb-3">No Tournaments Found</h3>
                                <p className="text-muted text-lg">We couldn't find any matches matching your criteria.</p>
                                <button className="btn btn-secondary mt-8" onClick={() => {setActiveTab('all'); setSearchQuery('');}}>Reset Filters</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Global Modals */}
            <AnimatePresence>
                {showCreateModal && <CreateTournamentModal onClose={() => setShowCreateModal(false)} />}
                {selectedTournament && (
                    <JoinBattleModal 
                        tournament={selectedTournament} 
                        onClose={() => setSelectedTournament(null)} 
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

export default Tournaments;
