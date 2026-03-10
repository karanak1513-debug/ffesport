import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (loginAdmin(email, password)) {
            navigate('/admin');
        } else {
            setError('Invalid Admin Credentials.');
        }
    };

    return (
        <div className="login-page fade-in d-flex justify-center align-center">
            <div className="glass-panel login-card">
                <div className="text-center mb-5">
                    <div className="auth-icon-wrapper mb-3">
                        <Shield className="text-primary" size={48} />
                    </div>
                    <h2 className="font-bold text-2xl text-gradient">Admin Login</h2>
                    <p className="text-muted text-sm mt-2">Access the FireBattle Control Center</p>
                </div>

                {error && (
                    <div className="error-alert mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group mb-4">
                        <label className="text-sm text-muted mb-2 d-block">Admin Email</label>
                        <input
                            type="email"
                            className="form-control glass-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group mb-5 position-relative">
                        <label className="text-sm text-muted mb-2 d-block">Password</label>
                        <div className="password-input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control glass-input with-icon"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 btn-glow">
                        Login as Admin
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-xs text-muted">Protected Area. Unauthorized access is strictly prohibited.</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
