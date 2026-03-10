/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(() => {
        return localStorage.getItem('firebattle_admin') === 'true';
    });
    const [isLoading] = useState(false);

    const loginAdmin = (email, password) => {
        if (email === 'firefire2674543015@gmail.com' && password === 'Karan@143') {
            setIsAdmin(true);
            localStorage.setItem('firebattle_admin', 'true');
            return true;
        }
        return false;
    };

    const logoutAdmin = () => {
        setIsAdmin(false);
        localStorage.removeItem('firebattle_admin');
    };

    return (
        <AuthContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
