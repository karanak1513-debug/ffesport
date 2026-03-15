/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInAnonymously,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Root Admin Emails - Users with these emails bypass regular role checks
const ADMIN_EMAILS = [
    'firefire2674543015@gmail.com',
    'karanak1513@gmail.com',
];

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isAdmin   = userData ? (userData.role === 'admin'   || ADMIN_EMAILS.includes(currentUser?.email)) : false;
    const isCreator = userData ? (userData.role === 'creator' && !isAdmin) : false;
    const isSuspended = userData ? (userData.status?.toLowerCase() === 'suspended') : false;

    // Sync Firestore User Data
    const syncUserData = async (user) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            // Critical Fix: If user is in ADMIN_EMAILS but document says otherwise, sync it now
            if (ADMIN_EMAILS.includes(user.email) && data.role !== 'admin') {
                console.log("Force syncing admin role for master account:", user.email);
                await updateDoc(userRef, { role: 'admin' });
                data.role = 'admin';
            }
            setUserData(data);
        } else {
            const newUser = {
                uid: user.uid,
                email: user.email,
                username: user.displayName || user.email?.split('@')[0] || 'Warrior',
                profilePhoto: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                role: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'player',
                status: 'active',
                createdAt: serverTimestamp(),
                joinedAt: serverTimestamp(), // keeping for compatibility
            };
            await setDoc(userRef, newUser);
            setUserData(newUser);
        }
    };

    const updateUserData = async (newData) => {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, newData, { merge: true });
        setUserData(prev => ({ ...prev, ...newData }));
    };

    useEffect(() => {
        let unsubscribeDoc = null;
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Initial sync
                await syncUserData(user);
                
                // Real-time listener for status/role changes
                unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (doc) => {
                    if (doc.exists()) {
                        setUserData(doc.data());
                    }
                });
            } else {
                setUserData(null);
                if (unsubscribeDoc) unsubscribeDoc();
            }
            setIsLoading(false);
        });
        
        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);



    const signup = async (email, password, username) => {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: username });
        await sendEmailVerification(res.user);
        return res;
    };

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    
    const googleLogin = () => signInWithPopup(auth, googleProvider);
    
    const logout = () => signOut(auth);
    
    const resetPassword = (email) => sendPasswordResetEmail(auth, email);

    const value = {
        currentUser,
        userData,
        isAdmin,
        isCreator,
        isSuspended,
        isLoading,
        signup,
        login,
        googleLogin,
        loginAnonymously: () => signInAnonymously(auth),
        logout,
        resetPassword,
        updateUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
