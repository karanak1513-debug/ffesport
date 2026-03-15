import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Mail, Globe, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            // Check if user is admin after login
            // Note: isAdmin is updated in AuthContext on state change
            // We'll trust the context to handle redirection in a useEffect if needed, 
            // but for simple flow, we can just navigate to dashboard and let routes handle it.
            navigate('/dashboard');
        } catch (err) {
            setError(err.message.replace('Firebase:', ''));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await googleLogin();
            navigate('/dashboard');
        } catch (err) {
            setError(err.message.replace('Firebase:', ''));
        }
    };

    return (
        <div className="login-page fade-in d-flex justify-center align-center">
            <div className="glass-panel login-card">
                <div className="text-center mb-5">
                    <div className="auth-icon-wrapper mb-3">
                        <Shield className="text-primary" size={48} />
                    </div>
                    <h2 className="font-bold text-2xl text-gradient">Welcome Back</h2>
                    <p className="text-muted text-sm mt-2">Login to your FireBattle account</p>
                </div>

                {error && (
                    <div className="error-alert mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group mb-4">
                        <label className="text-sm text-muted mb-2 d-block">Email Address</label>
                        <div className="password-input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                className="form-control glass-input with-icon"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group mb-2 position-relative">
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

                    <div className="text-right mb-4">
                        <Link to="/forgot-password" size="sm" className="forgot-link text-xs">
                            Forgot Password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 btn-glow d-flex align-center justify-center gap-2 mb-3"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : (
                            <>
                                Login <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="divider mb-3">
                        <span>OR</span>
                    </div>

                    <button 
                        type="button" 
                        onClick={handleGoogleLogin}
                        className="btn glass-btn w-100 d-flex align-center justify-center gap-2"
                    >
                        <Globe size={18} /> Continue with Google
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-muted">
                            Don't have an account? <Link to="/signup" className="text-primary font-medium">Sign Up</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
