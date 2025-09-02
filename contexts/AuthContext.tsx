import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthContextType, ActivityLog, KeywordUsage, Channel, HistoryItem } from '../types';
import { add, isAfter } from 'date-fns';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for an existing session
        setTimeout(() => {
            try {
                const storedUser = localStorage.getItem('utrend-user-session');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse user session from localStorage", error);
                localStorage.removeItem('utrend-user-session');
            }
            setLoading(false);
        }, 500);
    }, []);

    const logActivity = useCallback((action: string, icon: string) => {
        if (!user) return; // Only log for signed-in users

        const newActivity: ActivityLog = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.name,
            action,
            icon,
            timestamp: new Date().toISOString(),
        };

        const storedActivities = JSON.parse(localStorage.getItem('utrend-activity-log') || '[]');
        const updatedActivities = [newActivity, ...storedActivities].slice(0, 50); // Keep last 50
        localStorage.setItem('utrend-activity-log', JSON.stringify(updatedActivities));

    }, [user]);

    const getAllActivities = useCallback((): ActivityLog[] => {
        return JSON.parse(localStorage.getItem('utrend-activity-log') || '[]');
    }, []);

     const deleteUser = useCallback((userId: string) => {
        if (user?.id === userId) {
            throw new Error("Admins cannot delete their own account.");
        }

        const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
        const userEmail = Object.keys(storedUsers).find(email => storedUsers[email].id === userId);

        if (userEmail && storedUsers[userEmail]) {
            const deletedUserName = storedUsers[userEmail].name;
            delete storedUsers[userEmail];
            localStorage.setItem('utrend-users', JSON.stringify(storedUsers));
            logActivity(`deleted user: ${deletedUserName}`, 'Trash2');
        } else {
            throw new Error("User not found for deletion.");
        }
    }, [user, logActivity]);


    const login = async (email: string, pass: string): Promise<void> => {
        const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
        const userData = storedUsers[email];

        if (userData && userData.password === pass) {
            // One-time migration for existing users from youtubeChannelUrl to channels array
            if (userData.youtubeChannelUrl && !userData.channels) {
                userData.channels = [{
                    id: 'yt_migrated_' + userData.id,
                    platform: 'YouTube',
                    url: userData.youtubeChannelUrl
                }];
                delete userData.youtubeChannelUrl; // Clean up old field
                storedUsers[email] = userData;
                localStorage.setItem('utrend-users', JSON.stringify(storedUsers));
            }

            const loggedInUser: User = {
                id: userData.id,
                name: userData.name,
                email: email,
                plan: userData.plan,
                role: userData.role || 'user',
                country: userData.country,
                phone: userData.phone,
                company: userData.company,
                channels: userData.channels || [],
            };
            setUser(loggedInUser);
            localStorage.setItem('utrend-user-session', JSON.stringify(loggedInUser));
        } else {
            throw new Error("Invalid email or password.");
        }
    };

    const signUp = async (name: string, email: string, pass: string, plan: 'free' | 'starter' | 'pro'): Promise<void> => {
        const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
        if (storedUsers[email]) {
            throw new Error("User with this email already exists.");
        }
        
        const isFirstUser = Object.keys(storedUsers).length === 0;
        const role = isFirstUser ? 'admin' : 'user';

        const newUser: User = { id: Date.now().toString(), name, email, plan, role, channels: [] };
        storedUsers[email] = { ...newUser, password: pass };

        localStorage.setItem('utrend-users', JSON.stringify(storedUsers));
        setUser(newUser);
        localStorage.setItem('utrend-user-session', JSON.stringify(newUser));
    };
    
    const logout = () => {
        setUser(null);
        localStorage.removeItem('utrend-user-session');
    };

    const upgradePlan = useCallback((plan: 'starter' | 'pro') => {
        if (user) {
            const updatedUser = { ...user, plan: plan };
            setUser(updatedUser);
            localStorage.setItem('utrend-user-session', JSON.stringify(updatedUser));
            
            const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
            if(storedUsers[user.email]) {
                storedUsers[user.email].plan = plan;
                localStorage.setItem('utrend-users', JSON.stringify(storedUsers));
            }
            logActivity(`upgraded to the ${plan} plan`, 'Star');
        }
    }, [user, logActivity]);

    const getAllUsers = useCallback((): User[] => {
        const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
        return Object.values(storedUsers).map((u: any) => {
            const { password, youtubeChannelUrl, ...userWithoutSensitiveData } = u;
            return userWithoutSensitiveData as User;
        });
    }, []);

    const updateUser = useCallback((userId: string, updates: Partial<Pick<User, 'plan' | 'role'>>) => {
        const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
        const userEmail = Object.keys(storedUsers).find(email => storedUsers[email].id === userId);

        if (userEmail && storedUsers[userEmail]) {
            const updatedUserRecord = { ...storedUsers[userEmail], ...updates };
            storedUsers[userEmail] = updatedUserRecord;
            localStorage.setItem('utrend-users', JSON.stringify(storedUsers));

            const updatesString = Object.entries(updates).map(([key, value]) => `${key} to ${value}`).join(', ');
            logActivity(`updated user ${updatedUserRecord.name} (${updatesString})`, 'Edit');

            if (user?.id === userId) {
                 const updatedSessionUser = { ...user, ...updates };
                 setUser(updatedSessionUser);
                 localStorage.setItem('utrend-user-session', JSON.stringify(updatedSessionUser));
            }
        } else {
            throw new Error("User not found for update.");
        }
    }, [user, logActivity]);

    const updateProfile = useCallback(async (userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'country' | 'phone' | 'company' | 'channels'>>): Promise<void> => {
        const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
        const userEmailKey = Object.keys(storedUsers).find(email => storedUsers[email].id === userId);

        if (userEmailKey && storedUsers[userEmailKey]) {
            const oldUserData = storedUsers[userEmailKey];
            const updatedUserData = { ...oldUserData, ...updates };
            
            const newEmail = updates.email;
            if (newEmail && newEmail !== userEmailKey) {
                if (storedUsers[newEmail]) {
                    throw new Error("A user with this email already exists.");
                }
                delete storedUsers[userEmailKey];
                storedUsers[newEmail] = updatedUserData;
            } else {
                storedUsers[userEmailKey] = updatedUserData;
            }
            
            localStorage.setItem('utrend-users', JSON.stringify(storedUsers));

            if (user?.id === userId) {
                 const updatedSessionUser = { ...user, ...updates };
                 setUser(updatedSessionUser);
                 localStorage.setItem('utrend-user-session', JSON.stringify(updatedSessionUser));
            }
        } else {
            throw new Error("User not found for profile update.");
        }
    }, [user]);

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

        const storageKey = `utrend-keyword-usage-${user.id}`;
        let usageData: KeywordUsage | null = null;
        try {
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                usageData = JSON.parse(storedData);
            }
        } catch (e) {
            console.error("Failed to parse keyword usage data", e);
            localStorage.removeItem(storageKey);
        }

        const now = new Date();
        if (!usageData || isAfter(now, new Date(usageData.resetDate))) {
            const newResetDate = add(now, { days: 30 });
            usageData = { count: 0, resetDate: newResetDate.toISOString() };
            localStorage.setItem(storageKey, JSON.stringify(usageData));
        }
        
        const remaining = limit - usageData.count;
        return { remaining: remaining > 0 ? remaining : 0, limit };

    }, [user]);

    const logKeywordAnalysis = useCallback(() => {
        if (!user || user.plan === 'pro') return;

        const storageKey = `utrend-keyword-usage-${user.id}`;
        let usageData: KeywordUsage | null = null;
        try {
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                usageData = JSON.parse(storedData);
            }
        } catch (e) {
            console.error("Failed to parse keyword usage data", e);
            localStorage.removeItem(storageKey);
        }
        
        const now = new Date();
        if (!usageData || isAfter(now, new Date(usageData.resetDate))) {
            const newResetDate = add(now, { days: 30 });
            usageData = { count: 1, resetDate: newResetDate.toISOString() };
        } else {
            usageData.count += 1;
        }

        localStorage.setItem(storageKey, JSON.stringify(usageData));
        
    }, [user]);

    const getContentHistory = useCallback((): HistoryItem[] => {
        if (!user) return [];
        const storageKey = `utrend-history-${user.id}`;
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch (e) {
            console.error("Failed to parse content history", e);
            return [];
        }
    }, [user]);

    const addContentToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        if (!user) return;
        
        const newItem: HistoryItem = {
            ...item,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
        };

        const currentHistory = getContentHistory();
        const updatedHistory = [newItem, ...currentHistory].slice(0, 100); // Keep last 100 items

        const storageKey = `utrend-history-${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    }, [user, getContentHistory]);


    return (
        <AuthContext.Provider value={{ user, loading, login, signUp, logout, upgradePlan, getAllUsers, updateUser, updateProfile, logActivity, getAllActivities, deleteUser, getKeywordUsage, logKeywordAnalysis, getContentHistory, addContentToHistory }}>
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