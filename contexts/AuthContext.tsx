import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthContextType, ActivityLog } from '../types';

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
        // This is a mock login. In a real app, you'd call an API.
        const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
        if (storedUsers[email] && storedUsers[email].password === pass) {
            const loggedInUser: User = {
                id: storedUsers[email].id,
                name: storedUsers[email].name,
                email: email,
                plan: storedUsers[email].plan,
                role: storedUsers[email].role || 'user',
                country: storedUsers[email].country,
                phone: storedUsers[email].phone,
                company: storedUsers[email].company,
                followerCount: storedUsers[email].followerCount,
                youtubeChannelUrl: storedUsers[email].youtubeChannelUrl,
            };
            setUser(loggedInUser);
            localStorage.setItem('utrend-user-session', JSON.stringify(loggedInUser));
        } else {
            throw new Error("Invalid email or password.");
        }
    };

    const signUp = async (name: string, email: string, pass: string, plan: 'free' | 'starter' | 'pro'): Promise<void> => {
        // Mock sign-up
        const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
        if (storedUsers[email]) {
            throw new Error("User with this email already exists.");
        }
        
        const isFirstUser = Object.keys(storedUsers).length === 0;
        const role = isFirstUser ? 'admin' : 'user';

        const newUser: User = { id: Date.now().toString(), name, email, plan, role };
        storedUsers[email] = { ...newUser, password: pass }; // Store password only in mock DB

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
            
            // Also update the mock user database
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
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword as User;
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

            // If the admin is updating their own details, update the session as well
            if (user?.id === userId) {
                 const updatedSessionUser = { ...user, ...updates };
                 setUser(updatedSessionUser);
                 localStorage.setItem('utrend-user-session', JSON.stringify(updatedSessionUser));
            }
        } else {
            throw new Error("User not found for update.");
        }
    }, [user, logActivity]);

    const updateProfile = useCallback(async (userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'country' | 'phone' | 'company' | 'followerCount' | 'youtubeChannelUrl'>>): Promise<void> => {
        const storedUsers = JSON.parse(localStorage.getItem('utrend-users') || '{}');
        const userEmailKey = Object.keys(storedUsers).find(email => storedUsers[email].id === userId);

        if (userEmailKey && storedUsers[userEmailKey]) {
            const oldUserData = storedUsers[userEmailKey];
            const updatedUserData = { ...oldUserData, ...updates };
            
            const newEmail = updates.email;
            // If email is being updated, we need to change the key in our mock DB
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

            // If the current user is updating their own profile, update session
            if (user?.id === userId) {
                 const updatedSessionUser = { ...user, ...updates };
                 setUser(updatedSessionUser);
                 localStorage.setItem('utrend-user-session', JSON.stringify(updatedSessionUser));
            }
        } else {
            throw new Error("User not found for profile update.");
        }
    }, [user]);


    return (
        <AuthContext.Provider value={{ user, loading, login, signUp, logout, upgradePlan, getAllUsers, updateUser, updateProfile, logActivity, getAllActivities, deleteUser }}>
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