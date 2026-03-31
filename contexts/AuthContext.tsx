import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, AuthContextType, ActivityLog, KeywordUsage, HistoryItem, PlanName } from '../types';
import { auth, db, googleProvider } from '../firebase';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    signInWithPopup
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    orderBy, 
    limit, 
    onSnapshot, 
    addDoc,
    getDocs,
    deleteDoc
} from 'firebase/firestore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
        const errInfo = {
            error: error instanceof Error ? error.message : String(error),
            authInfo: {
                userId: auth.currentUser?.uid,
                email: auth.currentUser?.email,
                emailVerified: auth.currentUser?.emailVerified,
                isAnonymous: auth.currentUser?.isAnonymous,
            },
            operationType,
            path
        };
        console.error('Firestore Error: ', JSON.stringify(errInfo));
        throw new Error(JSON.stringify(errInfo));
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                try {
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setUser(userSnap.data() as User);
                    } else {
                        const newUser: User = {
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || 'User',
                            email: firebaseUser.email || '',
                            plan: 'free',
                            role: firebaseUser.email === 'akhathuto@gmail.com' ? 'admin' : 'user',
                            channels: []
                        };
                        await setDoc(userRef, newUser);
                        setUser(newUser);
                    }
                } catch (error) {
                    handleFirestoreError(error, 'get', `users/${firebaseUser.uid}`);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Listen to activities
    useEffect(() => {
        if (!user) {
            setActivities([]);
            return;
        }

        const activitiesRef = collection(db, 'users', user.id, 'activities');
        const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            const logs = snapshot.docs.map((doc: any) => ({
                ...doc.data(),
                id: doc.id
            })) as ActivityLog[];
            setActivities(logs);
        }, (error: any) => {
            handleFirestoreError(error, 'list', `users/${user.id}/activities`);
        });

        return () => unsubscribe();
    }, [user]);

    // Listen to history
    useEffect(() => {
        if (!user) {
            setHistory([]);
            return;
        }

        const historyRef = collection(db, 'users', user.id, 'history');
        const q = query(historyRef, orderBy('timestamp', 'desc'), limit(100));

        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            const items = snapshot.docs.map((doc: any) => ({
                ...doc.data(),
                id: doc.id
            })) as HistoryItem[];
            setHistory(items);
        }, (error: any) => {
            handleFirestoreError(error, 'list', `users/${user.id}/history`);
        });

        return () => unsubscribe();
    }, [user]);

    const logActivity = useCallback(async (action: string, icon: string) => {
        if (!user) return;

        const activityData = {
            userId: user.id,
            userName: user.name,
            action,
            icon,
            timestamp: new Date().toISOString(),
        };

        try {
            await addDoc(collection(db, 'users', user.id, 'activities'), activityData);
            await addDoc(collection(db, 'activities'), activityData);
        } catch (error) {
            handleFirestoreError(error, 'create', `users/${user.id}/activities`);
        }
    }, [user]);

    const getAllActivities = useCallback((): ActivityLog[] => {
        return activities;
    }, [activities]);

    const login = async (email: string, pass: string): Promise<void> => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const loginWithGoogle = async (): Promise<void> => {
        await signInWithPopup(auth, googleProvider);
    };

    const signUp = async (name: string, email: string, pass: string, plan: PlanName): Promise<void> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;
        
        const newUser: User = {
            id: firebaseUser.uid,
            name,
            email,
            plan,
            role: email === 'akhathuto@gmail.com' ? 'admin' : 'user',
            channels: []
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        setUser(newUser);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const upgradePlan = useCallback(async (plan: PlanName) => {
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.id), { plan });
                setUser(prev => prev ? { ...prev, plan } : null);
                await logActivity(`upgraded to the ${plan} plan`, 'Star');
            } catch (error) {
                handleFirestoreError(error, 'update', `users/${user.id}`);
            }
        }
    }, [user, logActivity]);

    const getAllUsers = useCallback(async (): Promise<User[]> => {
        if (!user || user.role !== 'admin') return [];
        try {
            const snapshot = await getDocs(collection(db, 'users'));
            return snapshot.docs.map((doc: any) => doc.data() as User);
        } catch (error) {
            handleFirestoreError(error, 'list', 'users');
            return [];
        }
    }, [user]);

    const updateUser = useCallback(async (userId: string, updates: Partial<Pick<User, 'plan' | 'role'>>) => {
        try {
            await updateDoc(doc(db, 'users', userId), updates);
            if (user?.id === userId) {
                setUser(prev => prev ? { ...prev, ...updates } : null);
            }
            await logActivity(`updated user ${userId}`, 'Edit');
        } catch (error) {
            handleFirestoreError(error, 'update', `users/${userId}`);
        }
    }, [user, logActivity]);

    const updateProfile = useCallback(async (userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'country' | 'phone' | 'company' | 'channels'>>): Promise<void> => {
        try {
            await updateDoc(doc(db, 'users', userId), updates);
            if (user?.id === userId) {
                setUser(prev => prev ? { ...prev, ...updates } : null);
            }
        } catch (error) {
            handleFirestoreError(error, 'update', `users/${userId}`);
        }
    }, [user]);

    const deleteUser = useCallback(async (userId: string) => {
        if (user?.id === userId) {
            throw new Error("Admins cannot delete their own account.");
        }
        try {
            await deleteDoc(doc(db, 'users', userId));
            await logActivity(`deleted user: ${userId}`, 'Trash2');
        } catch (error) {
            handleFirestoreError(error, 'delete', `users/${userId}`);
        }
    }, [user, logActivity]);

    const getKeywordUsage = useCallback((): { remaining: number, limit: number | 'unlimited' } => {
        if (!user) return { remaining: 0, limit: 0 };

        const limits = {
            free: 3,
            starter: 15,
            pro: 'unlimited' as const
        };
        const limit = limits[user.plan];

        if (limit === 'unlimited') {
            return { remaining: Infinity, limit: 'unlimited' };
        }

        // Placeholder for now, can be moved to Firestore if needed
        return { remaining: 10, limit };
    }, [user]);

    const logKeywordAnalysis = useCallback(async () => {
        // Placeholder
    }, []);

    const getContentHistory = useCallback((): HistoryItem[] => {
        return history;
    }, [history]);

    const addContentToHistory = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        if (!user) return;
        
        const historyData = {
            ...item,
            timestamp: new Date().toISOString(),
        };

        try {
            await addDoc(collection(db, 'users', user.id, 'history'), historyData);
        } catch (error) {
            handleFirestoreError(error, 'create', `users/${user.id}/history`);
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            loginWithGoogle,
            signUp, 
            logout, 
            upgradePlan, 
            getAllUsers, 
            updateUser, 
            updateProfile, 
            logActivity, 
            getAllActivities, 
            deleteUser, 
            getKeywordUsage, 
            logKeywordAnalysis, 
            getContentHistory, 
            addContentToHistory 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
