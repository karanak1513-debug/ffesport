/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {

    // Initial user match history
    const [matchHistory, setMatchHistory] = useState([
        { id: 101, name: "Daily Morning Faceoff", date: "Oct 24, 2024", result: "Won", points: 450, prize: "₹500" },
        { id: 102, name: "Solo King Championship", date: "Oct 22, 2024", result: "Lost", points: 20, prize: "-" },
    ]);

    // Firestore Collections State
    const [rawTournaments, setRawTournaments] = useState([]);
    const [users, setUsers] = useState([]);
    const [entries, setEntries] = useState([]);
    const [payments, setPayments] = useState([]);
    const [uidSubmissions, setUidSubmissions] = useState([]);

    const [currentTime, setCurrentTime] = useState(Date.now());

    // Listeners
    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
        return onSnapshot(q, (s) => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (s) => setRawTournaments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'entries'), orderBy('joinTime', 'desc'));
        return onSnapshot(q, (s) => setEntries(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'payments'), orderBy('submittedAt', 'desc'));
        return onSnapshot(q, (s) => setPayments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'uid_submissions'), orderBy('submitTime', 'desc'));
        return onSnapshot(q, (s) => setUidSubmissions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, []);

    // Interval for status
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
        return () => clearInterval(timer);
    }, []);

    const tournaments = rawTournaments.map(t => {
        if (t.status === 'completed' || t.status === 'closed') return t;
        try {
            let finalDateStr = t.date;
            if (t.date && t.date.toLowerCase() === 'today') finalDateStr = new Date().toDateString();
            let parsedTime = null;
            if (t.date && t.date.includes('-')) {
                const timePart = t.exactTime ? (t.exactTime.includes('AM') || t.exactTime.includes('PM') ? t.exactTime : `${t.exactTime}:00`) : '00:00:00';
                parsedTime = new Date(`${t.date}T${timePart.replace(' AM', '').replace(' PM', '')}`).getTime();
            } else {
                parsedTime = new Date(`${finalDateStr} ${t.exactTime || '00:00'}`).getTime();
            }
            if (parsedTime && !isNaN(parsedTime) && currentTime >= parsedTime) return { ...t, status: 'live' };
        } catch { /* ignore */ }
        return { ...t, status: 'upcoming' };
    });

    // Actions
    const joinTournament = async (tournamentId, playerData) => {
        try {
            const userId = playerData.userId || `guest_${Date.now()}`;
            await addDoc(collection(db, 'entries'), { tournamentId, userId, username: playerData.name, paymentStatus: 'pending', joinTime: Date.now() });
            await addDoc(collection(db, 'payments'), { tournamentId, userId, username: playerData.name, amount: playerData.entryFee, screenshot: playerData.screenshotId, status: 'pending', submittedAt: Date.now() });
            await addDoc(collection(db, 'uid_submissions'), { tournamentId, userId, freeFireUID: playerData.ffuid, submitTime: Date.now() });

            const tRef = doc(db, 'tournaments', tournamentId);
            const tData = rawTournaments.find(t => t.id === tournamentId);
            await updateDoc(tRef, { players: (tData?.players || 0) + 1 });
            return true;
        } catch (error) { console.error(error); return false; }
    };

    const createTournament = async (newT) => {
        try { await addDoc(collection(db, 'tournaments'), { ...newT, players: 0, status: 'upcoming', createdAt: Date.now(), roomId: '', roomPassword: '' }); }
        catch (error) { console.error(error); }
    };

    const updateRoomDetails = async (id, roomId, roomPassword) => {
        try { await updateDoc(doc(db, 'tournaments', id), { roomId, roomPassword }); }
        catch (error) { console.error(error); }
    };

    const approvePayment = async (paymentId, tournamentId, userId) => {
        try {
            await updateDoc(doc(db, 'payments', paymentId), { status: 'approved' });
            // Find the entry for this user and tournament and approve it
            const entriesRef = collection(db, 'entries');
            const q = query(entriesRef, where('tournamentId', '==', tournamentId), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (d) => {
                await updateDoc(doc(db, 'entries', d.id), { paymentStatus: 'approved' });
            });
        } catch (error) { console.error(error); }
    };

    const rejectPayment = async (paymentId) => {
        try { await updateDoc(doc(db, 'payments', paymentId), { status: 'rejected' }); }
        catch (error) { console.error(error); }
    };

    const startMatch = async (id) => {
        try { await updateDoc(doc(db, 'tournaments', id), { status: 'live' }); }
        catch (error) { console.error(error); }
    };

    const endMatch = async (id) => {
        try { await updateDoc(doc(db, 'tournaments', id), { status: 'completed' }); }
        catch (error) { console.error(error); }
    };

    const deleteTournament = async (id) => {
        try { await deleteDoc(doc(db, 'tournaments', id)); }
        catch (error) { console.error(error); }
    };

    const deleteUser = async (uId) => {
        if (window.confirm("Delete?")) await deleteDoc(doc(db, 'users', uId));
    };

    const toggleUserStatus = async (uId, status) => {
        await updateDoc(doc(db, 'users', uId), { status: status === 'Active' ? 'Banned' : 'Active' });
    };

    return (
        <AppContext.Provider value={{
            tournaments, users, entries, payments, uidSubmissions,
            joinTournament, createTournament, updateRoomDetails,
            approvePayment, rejectPayment, startMatch, endMatch,
            deleteTournament, deleteUser, toggleUserStatus
        }}>
            {children}
        </AppContext.Provider>
    );
};
