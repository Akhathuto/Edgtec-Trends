import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Sliders, User as UserIcon, Shield } from './Icons';

const AdminDashboard: React.FC = () => {
    const { user, getAllUsers, updateUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (user?.role === 'admin') {
            setUsers(getAllUsers());
        }
    }, [user, getAllUsers]);

    const handlePlanChange = (userId: string, newPlan: 'free' | 'pro') => {
        updateUser(userId, { plan: newPlan });
        setUsers(getAllUsers()); // Refresh user list
    };

    const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
        // Prevent admin from demoting themselves
        if (user?.id === userId && newRole === 'user') {
            alert("You cannot remove your own admin role.");
            return;
        }
        updateUser(userId, { role: newRole });
        setUsers(getAllUsers()); // Refresh user list
    };

    if (user?.role !== 'admin') {
        return <p className="text-center text-red-400">Access Denied. This area is for admins only.</p>;
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-2xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
                    <Sliders className="w-6 h-6 text-purple-400" /> Admin Dashboard
                </h2>

                <section>
                    <h3 className="text-xl font-bold text-purple-300 mb-4 border-b border-gray-700 pb-2">User Management</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.map((managedUser) => (
                                    <tr key={managedUser.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                                                    <UserIcon className="h-6 w-6 text-gray-400"/>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">{managedUser.name}</div>
                                                    <div className="text-sm text-gray-400">{managedUser.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={managedUser.plan}
                                                onChange={(e) => handlePlanChange(managedUser.id, e.target.value as 'free' | 'pro')}
                                                className="w-full bg-gray-800 border border-gray-600 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple"
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={managedUser.role}
                                                onChange={(e) => handleRoleChange(managedUser.id, e.target.value as 'admin' | 'user')}
                                                disabled={user?.id === managedUser.id}
                                                className="w-full bg-gray-800 border border-gray-600 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
