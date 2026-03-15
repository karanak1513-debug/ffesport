import React, { useState } from 'react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            await resetPassword(email);
            setMessage('Check your inbox for password reset instructions.');
        } catch (err) {
            setError(err.message.replace('Firebase:', ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page fade-in d-flex justify-center align-center">
            <div className="glass-panel login-card">
                <div className="text-center mb-5">
                    <div className="auth-icon-wrapper mb-3">
                        <RefreshCw className="text-primary" size={48} />
                    </div>
                    <h2 className="font-bold text-2xl text-gradient">Reset Password</h2>
                    <p className="text-muted text-sm mt-2">Enter your email to receive a reset link</p>
                </div>

                {error && (
                    <div className="error-alert mb-4">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="success-alert mb-4">
                        {message}
                    </div>
                )}

                <form onSubmit={handleReset}>
                    <div className="form-group mb-5">
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

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 btn-glow mb-4"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-muted hover-text-white d-flex align-center justify-center gap-2">
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
