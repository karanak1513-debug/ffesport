import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAdmin, logoutAdmin } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        logoutAdmin();
        setIsOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar glass-panel">
            <div className="container nav-container">
                <Link to="/" className="brand">
                    <span className="text-gradient font-bold text-2xl">FireBattle</span>
                    <span className="text-muted text-sm ml-1">Arena</span>
                </Link>

                <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/tournaments" onClick={() => setIsOpen(false)}>Tournaments</Link>
                    <Link to="/leaderboard" onClick={() => setIsOpen(false)}>Leaderboard</Link>
                    <Link to="/admin/tutorial" onClick={() => setIsOpen(false)}>Tutorial / How to Create Tournament</Link>
                    {isAdmin && (
                        <Link to="/admin" onClick={() => setIsOpen(false)} className="text-warning flex align-center d-flex gap-2">
                            <Shield size={16} /> Admin Panel
                        </Link>
                    )}
                </div>

                <div className="nav-actions desktop-only">
                    {isAdmin ? (
                        <button className="btn btn-outline btn-sm d-flex align-center gap-2" onClick={handleLogout}>
                            <LogOut size={16} /> Logout
                        </button>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm d-flex align-center gap-2">
                            <LogIn size={16} /> Admin Login
                        </Link>
                    )}
                </div>

                <button className="mobile-toggle" onClick={toggleMenu}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
