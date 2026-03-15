import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, Shield, User, Star, Zap, Home as HomeIcon, Trophy, BarChart2, Info, Swords, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAdmin, isCreator, currentUser, userData, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setIsOpen(false); }, [location]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { to: '/', label: 'Home', icon: <HomeIcon size={18} /> },
        { to: '/tournaments', label: 'Tournaments', icon: <Trophy size={18} /> },
        { to: '/leaderboard', label: 'Leaderboard', icon: <BarChart2 size={18} /> },
        { to: '/how-to-play', label: 'How To Play', icon: <Info size={18} /> },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-container">
                <Link to="/" className="brand">
                    <Zap size={22} className="brand-logo" />
                    <span className="brand-name">FIRE<span className="brand-highlight">BATTLE</span></span>
                </Link>

                <div className="nav-links desktop-only">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className={`nav-link admin-btn ${isActive('/admin') ? 'active' : ''}`}
                        >
                            <Shield size={16} /> Admin Panel
                        </Link>
                    )}

                    <a 
                        href="https://www.instagram.com/its_sun_official_ok/?__pwa=1#" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="nav-link text-instagram flex items-center gap-1 font-bold"
                    >
                        <Instagram size={16} /> INSTAGRAM
                    </a>

                    {(isCreator || isAdmin) && (
                        <Link
                            to="/creator"
                            className={`nav-link creator-btn ${isActive('/creator') ? 'active' : ''}`}
                        >
                            <Swords size={16} /> My Panel
                        </Link>
                    )}
                </div>

                <div className="nav-actions desktop-only">
                    {currentUser ? (
                        <div className="user-profile-menu">
                            <Link to="/dashboard" className="nav-profile-link">
                                {userData?.profilePhoto ? (
                                    <img src={userData.profilePhoto} alt="avatar" className="nav-avatar" />
                                 ) : (
                                    <div className="nav-avatar-placeholder">
                                         {userData?.username?.charAt(0).toUpperCase()}
                                    </div>
                                 )}
                                 <div className="flex flex-col">
                                     <span className="font-bold">{userData?.username || 'Profile'}</span>
                                     {userData?.status?.toLowerCase() === 'suspended' && (
                                         <span className="text-[10px] text-red-500 font-black leading-none uppercase">Suspended</span>
                                     )}
                                 </div>
                            </Link>
                            <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">
                            <LogIn size={18} /> Login
                        </Link>
                    )}
                </div>

                <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="mobile-nav-list">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`mobile-link ${isActive(link.to) ? 'active' : ''}`}
                                >
                                    {link.icon} {link.label}
                                </Link>
                            ))}
                            
                            {isAdmin && (
                                <Link to="/admin" className="mobile-link admin-link">
                                    <Shield size={18} /> Admin Panel
                                </Link>
                            )}

                            {(isCreator || isAdmin) && (
                                <Link to="/creator" className="mobile-link creator-link">
                                    <Swords size={18} /> My Panel
                                </Link>
                            )}

                            <div className="mobile-menu-divider"></div>

                            {currentUser ? (
                                <>
                                    <Link to="/dashboard" className="mobile-link">
                                        <User size={18} /> My Profile
                                    </Link>
                                    <button className="mobile-link logout-link" onClick={handleLogout}>
                                        <LogOut size={18} /> Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="mobile-btn-login">
                                    <LogIn size={18} /> Login to Arena
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
