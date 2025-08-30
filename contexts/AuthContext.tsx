import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for an existing session
        setTimeout(() => {
            try {
                const storedUser = localStorage.getItem('edgtec-user-session');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse user session from localStorage", error);
                localStorage.removeItem('edgtec-user-session');
            }
            setLoading(false);
        }, 500);
    }, []);

    const login = async (email: string, pass: string): Promise<void> => {
        // This is a mock login. In a real app, you'd call an API.
        const storedUsers = JSON.parse(localStorage.getItem('edgtec-users') || '{}');
        if (storedUsers[email] && storedUsers[email].password === pass) {
            const loggedInUser: User = {
                id: storedUsers[email].id,
                name: storedUsers[email].name,
                email: email,
                plan: storedUsers[email].plan,
                role: storedUsers[email].role || 'user',
            };
            setUser(loggedInUser);
            localStorage.setItem('edgtec-user-session', JSON.stringify(loggedInUser));
        } else {
            throw new Error("Invalid email or password.");
        }
    };

    const signUp = async (name: string, email: string, pass: string, plan: 'free' | 'pro'): Promise<void> => {
        // Mock sign-up
        const storedUsers = JSON.parse(localStorage.getItem('edgtec-users') || '{}');
        if (storedUsers[email]) {
            throw new Error("User with this email already exists.");
        }
        
        const isFirstUser = Object.keys(storedUsers).length === 0;
        const role = isFirstUser ? 'admin' : 'user';

        const newUser: User = { id: Date.now().toString(), name, email, plan, role };
        storedUsers[email] = { ...newUser, password: pass }; // Store password only in mock DB

        localStorage.setItem('edgtec-users', JSON.stringify(storedUsers));
        setUser(newUser);
        localStorage.setItem('edgtec-user-session', JSON.stringify(newUser));
    };
    
    const logout = () => {
        setUser(null);
        localStorage.removeItem('edgtec-user-session');
    };

    const upgradePlan = () => {
        if (user) {
            const updatedUser = { ...user, plan: 'pro' as 'pro' };
            setUser(updatedUser);
            localStorage.setItem('edgtec-user-session', JSON.stringify(updatedUser));
            
            // Also update the mock user database
            const storedUsers = JSON.parse(localStorage.getItem('edgtec-users') || '{}');
            if(storedUsers[user.email]) {
                storedUsers[user.email].plan = 'pro';
                localStorage.setItem('edgtec-users', JSON.stringify(storedUsers));
            }
        }
    };

    const getAllUsers = (): User[] => {
        const storedUsers = JSON.parse(localStorage.getItem('edgtec-users') || '{}');
        return Object.values(storedUsers).map((u: any) => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword as User;
        });
    };

    const updateUser = (userId: string, updates: Partial<Pick<User, 'plan' | 'role'>>) => {
        const storedUsers = JSON.parse(localStorage.getItem('edgtec-users') || '{}');
        const userEmail = Object.keys(storedUsers).find(email => storedUsers[email].id === userId);

        if (userEmail && storedUsers[userEmail]) {
            storedUsers[userEmail] = { ...storedUsers[userEmail], ...updates };
            localStorage.setItem('edgtec-users', JSON.stringify(storedUsers));

            // If the admin is updating their own details, update the session as well
            if (user?.id === userId) {
                 const updatedSessionUser = { ...user, ...updates };
                 setUser(updatedSessionUser);
                 localStorage.setItem('edgtec-user-session', JSON.stringify(updatedSessionUser));
            }
        } else {
            throw new Error("User not found for update.");
        }
    };


    return (
        <AuthContext.Provider value={{ user, loading, login, signUp, logout, upgradePlan, getAllUsers, updateUser }}>
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