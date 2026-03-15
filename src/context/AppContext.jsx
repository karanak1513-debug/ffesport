/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, onValue, set } from 'firebase/database';
import { db, rtdb, auth } from '../firebase';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {

    // Firestore Collections State
    const [rawTournaments, setRawTournaments] = useState([]);
    const [users, setUsers] = useState([]);
    const [entries, setEntries] = useState([]);
    const [tournamentPlayers, setTournamentPlayers] = useState([]);
    const [adminSettings, setAdminSettings] = useState({});
    const [payments, setPayments] = useState([]);
    const [uidSubmissions, setUidSubmissions] = useState([]);
    const [liveRoomDetails, setLiveRoomDetails] = useState({});
    const [liveMessages, setLiveMessages] = useState({});

    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Listeners
    useEffect(() => {
        const q = query(collection(db, 'tournament_players'), orderBy('joinTime', 'desc'));
        return onSnapshot(q, 
            (s) => setTournamentPlayers(s.docs.map(d => ({ id: d.id, ...d.data() }))),
            (err) => console.warn("Tournament players sync failed:", err)
        );
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'admin_settings'));
        return onSnapshot(q, 
            (s) => {
                const settings = {};
                s.forEach(doc => settings[doc.id] = doc.data());
                setAdminSettings(settings);
            },
            (err) => console.warn("Admin settings sync failed:", err)
        );
    }, []);
    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
        return onSnapshot(q, 
            (s) => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))),
            (err) => console.warn("Users sync failed:", err)
        );
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, 
            (s) => setRawTournaments(s.docs.map(d => ({ id: d.id, ...d.data() }))),
            (err) => console.warn("Tournaments sync failed:", err)
        );
    }, []);

    // RTDB Listener for room details & Chat (Lower latency)
    useEffect(() => {
        const roomRef = ref(rtdb, 'match_details');
        const r1 = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setLiveRoomDetails(data);
        });

        const chatRef = ref(rtdb, 'chats');
        const r2 = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setLiveMessages(data);
        });

        return () => { r1(); r2(); };
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'entries'), orderBy('joinTime', 'desc'));
        return onSnapshot(q, 
            (s) => setEntries(s.docs.map(d => ({ id: d.id, ...d.data() }))),
            (err) => console.warn("Entries sync failed:", err)
        );
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'payments'), orderBy('submittedAt', 'desc'));
        return onSnapshot(q, 
            (s) => setPayments(s.docs.map(d => ({ id: d.id, ...d.data() }))),
            (err) => console.warn("Payments sync failed:", err)
        );
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'uid_submissions'), orderBy('submitTime', 'desc'));
        return onSnapshot(q, 
            (s) => setUidSubmissions(s.docs.map(d => ({ id: d.id, ...d.data() }))),
            (err) => console.warn("UID submissions sync failed:", err)
        );
    }, []);

    // Interval for status
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
        return () => clearInterval(timer);
    }, []);

    const normalizedTournaments = React.useMemo(() => {
        return rawTournaments.map(t => {
            const rtdbData = liveRoomDetails[t.id] || {};
            
            // Enhanced sanitize to fix data mash-ups (e.g., "2024-01-012024-01-02" or "₹50001000")
            const sanitize = (val) => {
                if (!val || typeof val !== 'string') return val;
                
                // Case 1: Simple perfect double (₹50₹50)
                const half = Math.floor(val.length / 2);
                if (val.length >= 4 && val.substring(0, half) === val.substring(half)) {
                    return val.substring(0, half);
                }

                // Case 2: Date mashup (2024-12-252024-12-26) - pick first YYYY-MM-DD
                const dateMatch = val.match(/^\d{4}-\d{2}-\d{2}/);
                if (dateMatch) return dateMatch[0];

                // Case 3: Currency/Number mashup (₹50001000 or ₹500₹500)
                // If it starts with ₹ followed by numbers, and then has more numbers or ₹, split it at the logical end
                // We'll look for the first continuous block of currency + digits
                const priceMatch = val.match(/^[₹RS\s]*\d+/i);
                if (priceMatch && priceMatch[0].length < val.length) {
                    // Only return the first part if it looks like a mashup (2 blocks of numbers/symbols)
                    return priceMatch[0];
                }

                return val;
            };

            const cleanT = {
                ...t,
                id: String(t.id),
                name: sanitize(t.name) || 'Untitled Tournament',
                prize: sanitize(t.prize || t.prizePool || 'TBA'),
                entry: sanitize(t.entry || t.entryFee || 'Free'),
                date: sanitize(t.date || t.matchDate || 'TBD'),
                exactTime: sanitize(t.exactTime || t.time || t.matchTime || '00:00'),
                roomId: rtdbData.roomId || t.roomId || '',
                roomPassword: rtdbData.roomPassword || t.roomPassword || ''
            };

            if (cleanT.status === 'completed' || cleanT.status === 'closed' || cleanT.status === 'live') return cleanT;
            
            try {
                let finalDateStr = cleanT.date;
                if (typeof finalDateStr === 'string' && finalDateStr.toLowerCase() === 'today') {
                    finalDateStr = new Date().toDateString();
                }
                
                let parsedTime = null;
                const timeStr = cleanT.exactTime;
                
                if (finalDateStr && String(finalDateStr).includes('-')) {
                    const timePart = timeStr ? (String(timeStr).includes('AM') || String(timeStr).includes('PM') ? timeStr : `${timeStr}:00`) : '00:00:00';
                    const isoDate = `${finalDateStr}T${timePart.replace(' AM', '').replace(' PM', '')}`;
                    parsedTime = new Date(isoDate).getTime();
                } else if (finalDateStr) {
                    parsedTime = new Date(`${finalDateStr} ${timeStr || '00:00'}`).getTime();
                }
                
                if (parsedTime && !isNaN(parsedTime) && currentTime >= parsedTime) return { ...cleanT, status: 'live' };
            } catch (err) { 
                console.warn("Date parse error for", cleanT.id, err); 
            }
            
            return { ...cleanT, status: cleanT.status || 'upcoming' };
        });
    }, [rawTournaments, liveRoomDetails, currentTime]);

    const tournaments = normalizedTournaments;

    // Actions
    const joinTournament = async (tournamentId, playerData) => {
        try {
            const userId = playerData.userId;
            if (!userId) throw new Error("Authentication required to join.");

            console.log("Saving join request to Firestore...");
            
            // Core requirement: Store in "tournament_players"
            const docRef = await addDoc(collection(db, 'tournament_players'), { 
                tournamentId, 
                playerId: userId, 
                userId, // redundant but safe
                playerName: playerData.playerName, 
                freeFireUID: playerData.ffuid || playerData.freefireUID || playerData.freeFireUID,
                winningUpi: playerData.winningUpi || '',
                teamName: playerData.teamName || 'Solo',
                utrNumber: playerData.utrNumber || '',
                transactionId: playerData.transactionId || '',
                status: 'pending', 
                createdAt: serverTimestamp(),
                joinTime: serverTimestamp() 
            });
            console.log("Firestore join request ID:", docRef.id);

            // Try to update player count
            try {
                const tRef = doc(db, 'tournaments', tournamentId);
                const tData = rawTournaments.find(t => t.id === tournamentId);
                if (tData) {
                    await updateDoc(tRef, { players: (tData.players || 0) + 1 });
                }
            } catch (pError) {
                console.warn("Could not update player count:", pError);
            }

            return { success: true };
        } catch (error) { 
            console.error("Join Battle Error:", error); 
            return { success: false, error: error.message }; 
        }
    };

    const createTournament = async (newT) => {
        try {
            await addDoc(collection(db, 'tournaments'), {
                ...newT,
                players: 0,
                status: 'open',
                createdAt: serverTimestamp(),
                roomId: '',
                roomPassword: '',
                winners: null
                // creatorId is already in newT often, but let's ensure it maps if modal uses createdBy
            });
            return true;
        } catch (error) {
            console.error("Create tournament error:", error);
            throw error;
        }
    };

    const updateTournament = async (id, updatedData) => {
        try {
            const currentUser = auth.currentUser;
            // Strip internal/computed fields that should not be overwritten
            const { id: _id, players, status, createdAt, createdBy, creatorId, creatorName, ...safeData } = updatedData;
            await updateDoc(doc(db, 'tournaments', id), {
                ...safeData,
                updatedAt: serverTimestamp(),
                updatedBy: currentUser?.uid || 'system_admin'
            });
            return { success: true };
        } catch (error) {
            console.error('Update tournament error:', error);
            return { success: false, error: error.message };
        }
    };

    const promoteToCreator = async (uId, currentRole) => {
        try {
            const newRole = currentRole === 'creator' ? 'player' : 'creator';
            await updateDoc(doc(db, 'users', uId), { role: newRole });
            return { success: true };
        } catch (error) { console.error(error); return { success: false, error: error.message }; }
    };

    const updateRoomDetails = async (id, roomId, roomPassword) => {
        try {
            const currentUser = auth.currentUser;
            // Update Firestore (Source of truth/Permanent storage)
            await updateDoc(doc(db, 'tournaments', id), { 
                roomId, 
                roomPassword,
                updatedAt: serverTimestamp(),
                updatedBy: currentUser?.uid || 'system_admin'
            }); 
            
            // Update RTDB (Ultra-fast sync for players)
            await set(ref(rtdb, `match_details/${id}`), { roomId, roomPassword, updatedAt: Date.now() });

            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    };


    const approvePayment = async (paymentId, tournamentId, userId) => {
        try {
            await updateDoc(doc(db, 'payments', paymentId), { status: 'approved' });
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

    const startMatch = async (id, currentStatus) => {
        try {
            if (['completed', 'closed', 'cancelled'].includes(currentStatus)) {
                return { success: false, error: `Cannot start. Arena is already ${currentStatus}.` };
            }
            if (currentStatus === 'live') {
                return { success: false, error: 'Tournament is already live.' };
            }
            const currentUser = auth.currentUser;
            await updateDoc(doc(db, 'tournaments', id), { 
                status: 'live',
                liveAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                updatedBy: currentUser?.uid || 'system_admin'
            });
            return { success: true };
        } catch (error) { 
            console.error(error); 
            return { success: false, error: error.message }; 
        }
    };

    const publishRoomDetails = async (id) => {
        try {
            const currentUser = auth.currentUser;
            
            // Check if Room properties exist
            const tDoc = await getDoc(doc(db, 'tournaments', id));
            if (!tDoc.exists() || !tDoc.data().roomId || !tDoc.data().roomPassword) {
                return { success: false, error: "Please set Room ID and Password first using the Key icon." };
            }

            await updateDoc(doc(db, 'tournaments', id), {
                roomPublished: true,
                roomPublishedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                updatedBy: currentUser?.uid || 'system_admin'
            });

            // Distribute a global notification via RTDB match chat
            const msgId = `sys_announce_${Date.now()}`;
            await set(ref(rtdb, `chats/${id}/${msgId}`), {
                sender: "Admin System",
                text: "ROOM DETAILS ARE NOW LIVE! Check your cards.",
                role: "admin",
                time: Date.now()
            });

            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    };

    const endWithWinners = async (id, winnersData, currentStatus) => {
        try {
            // Only truly block closed/cancelled — completed can have winners updated
            if (['closed', 'cancelled'].includes(currentStatus)) {
                return { success: false, error: `Cannot update. Arena is already ${currentStatus}.` };
            }
            const currentUser = auth.currentUser;

            if (winnersData) {
                const winnersToSave = {
                    first:  winnersData?.first  || winnersData?.winner || '',
                    second: winnersData?.second || '',
                    third:  winnersData?.third  || '',
                    kills:  winnersData?.kills || 0,
                    points: winnersData?.points || 0
                };

                if (currentStatus === 'completed') {
                    // Already completed — just update winners, don't touch status
                    await updateDoc(doc(db, 'tournaments', id), {
                        winners:   winnersToSave,
                        updatedAt: serverTimestamp(),
                        updatedBy: currentUser?.uid || 'system_admin'
                    });
                } else {
                    await updateDoc(doc(db, 'tournaments', id), {
                        status:      'completed',
                        winners:     winnersToSave,
                        completedAt: serverTimestamp(),
                        updatedAt:   serverTimestamp(),
                        updatedBy:   currentUser?.uid || 'system_admin'
                    });
                }
            } else {
                // End without winners — still mark completed if not already
                if (currentStatus !== 'completed') {
                    await updateDoc(doc(db, 'tournaments', id), {
                        status:      'completed',
                        completedAt: serverTimestamp(),
                        updatedAt:   serverTimestamp(),
                        updatedBy:   currentUser?.uid || 'system_admin'
                    });
                }
            }
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    };

    const deleteTournament = async (id) => {
        try { 
            // 1. Clean up player join requests attached to this tournament
            const joinQuery = query(collection(db, 'tournament_players'), where('tournamentId', '==', id));
            const joinSnapshot = await getDocs(joinQuery);
            for (const joinDoc of joinSnapshot.docs) {
                await deleteDoc(doc(db, 'tournament_players', joinDoc.id));
            }

            // 2. Delete the tournament document itself
            await deleteDoc(doc(db, 'tournaments', id));
            return { success: true };
        } catch (error) { 
            console.error(error); 
            return { success: false, error: error.message }; 
        }
    };
    
    const approvePlayer = async (playerId, tournamentId) => {
        try {
            console.log("Approving player request:", playerId, "for arena:", tournamentId);
            
            const tData = rawTournaments.find(t => t.id === tournamentId);
            if (tData) {
                const status = (tData.status || '').toLowerCase();
                if (['closed', 'completed', 'cancelled'].includes(status)) {
                    return { success: false, error: `Cannot approve. Arena is already ${status}.` };
                }
            }
            
            const currentUser = auth.currentUser;
            await updateDoc(doc(db, 'tournament_players', playerId), { 
                status: 'approved',
                updatedAt: serverTimestamp(),
                approvedAt: serverTimestamp(),
                updatedBy: currentUser?.uid || 'system_admin'
            });
            return { success: true };
        } catch (error) {
            console.error("Approve player error:", error);
            return { success: false, error: error.message };
        }
    };

    const rejectPlayerAndFreeSpot = async (playerId, tournamentId, currentStatus) => {
        try {
            console.log("Rejecting player request:", playerId);
            const currentUser = auth.currentUser;
            await updateDoc(doc(db, 'tournament_players', playerId), { 
                status: 'rejected',
                updatedAt: serverTimestamp(),
                rejectedAt: serverTimestamp(),
                updatedBy: currentUser?.uid || 'system_admin'
            });
            
            // Only free the slot if they weren't already rejected
            if (currentStatus !== 'rejected') {
                const tRef = doc(db, 'tournaments', tournamentId);
                const tData = rawTournaments.find(t => t.id === tournamentId);
                if (tData && tData.players > 0) {
                    await updateDoc(tRef, { players: tData.players - 1 });
                }
            }
            return { success: true };
        } catch(e) {
            console.error("Reject player error:", e);
            return { success: false, error: e.message };
        }
    };

    const removePlayer = async (playerId) => {
        try {
            console.log("Removing player request completely:", playerId);
            await deleteDoc(doc(db, 'tournament_players', playerId));
            return { success: true };
        } catch (error) {
            console.error("Remove player error:", error);
            return { success: false, error: error.message };
        }
    };

    const deleteUserRecord = async (uId) => {
        try {
            // 1. Find all tournaments by this creator
            const tQuery = query(collection(db, 'tournaments'), where('createdBy', '==', uId));
            const tSnapshot = await getDocs(tQuery);
            const tournamentIds = tSnapshot.docs.map(d => d.id);

            // 2. Delete all player joins for these tournaments
            for (const tId of tournamentIds) {
                const pQuery = query(collection(db, 'tournament_players'), where('tournamentId', '==', tId));
                const pSnapshot = await getDocs(pQuery);
                for (const pDoc of pSnapshot.docs) {
                    await deleteDoc(doc(db, 'tournament_players', pDoc.id));
                }
                // 3. Delete the tournament itself
                await deleteDoc(doc(db, 'tournaments', tId));
            }

            // 4. Delete the user document
            await deleteDoc(doc(db, 'users', uId));
            return { success: true };
        } catch (error) {
            console.error("Delete user error:", error);
            return { success: false, error: error.message };
        }
    };

    const toggleUserStatus = async (uId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
            await updateDoc(doc(db, 'users', uId), { status: newStatus });
            return { success: true, status: newStatus };
        } catch (error) {
            console.error("Toggle status error:", error);
            return { success: false, error: error.message };
        }
    };

    const promoteToAdmin = async (uId, currentRole) => {
        try {
            await updateDoc(doc(db, 'users', uId), { role: currentRole === 'admin' ? 'player' : 'admin' });
            return { success: true };
        } catch (error) { console.error(error); return { success: false, error: error.message }; }
    };



    const submitLateUID = async (tournamentId, userId, username, freeFireUID) => {
        try {
            await addDoc(collection(db, 'uid_submissions'), { tournamentId, userId, playerName: username, freeFireUID, submitTime: Date.now() });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const sendRoomMessage = async (tournamentId, messageData) => {
        try {
            const msgId = Date.now().toString();
            await set(ref(rtdb, `chats/${tournamentId}/${msgId}`), {
                ...messageData,
                time: Date.now()
            });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return (
        <AppContext.Provider value={{
            tournaments, users, tournamentPlayers, adminSettings, liveMessages,
            joinTournament, createTournament, updateTournament, updateRoomDetails,
            approvePlayer,
            rejectPlayer: rejectPlayerAndFreeSpot,
            removePlayer,
            startMatch, publishRoomDetails, endMatch: endWithWinners,
            deleteTournament, deleteUser: deleteUserRecord, toggleUserStatus, promoteToAdmin, promoteToCreator, submitLateUID,
            sendRoomMessage
        }}>
            {children}
        </AppContext.Provider>
    );
};
