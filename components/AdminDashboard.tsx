import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Sliders, User as UserIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';

const AdminDashboard: React.FC = () => {
    const { user, getAllUsers, updateUser } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (user?.role === 'admin') {
            setUsers(getAllUsers());
        }
    }, [user?.role, getAllUsers]);

    const handlePlanChange = useCallback((userId: string, newPlan: User['plan']) => {
        try {
            const userToUpdate = users.find(u => u.id === userId);
            if (!userToUpdate) return;
            
            updateUser(userId, { plan: newPlan });
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
            showToast(`Updated ${userToUpdate.name}'s plan to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}.`);
        } catch (e: any) {
            console.error("Failed to update plan:", e.message);
        }
    }, [users, updateUser, showToast]);

    const handleRoleChange = useCallback((userId: string, newRole: 'admin' | 'user') => {
        if (user?.id === userId && newRole === 'user') {
            alert("You cannot remove your own admin role.");
            const selectElement = document.getElementById(`role-${userId}`) as HTMLSelectElement;
            if (selectElement) selectElement.value = 'admin';
            return;
        }
        try {
            const userToUpdate = users.find(u => u.id === userId);
            if (!userToUpdate) return;

            updateUser(userId, { role: newRole });
            setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
            showToast(`Updated ${userToUpdate.name}'s role to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}.`);
        } catch (e: any) {
             console.error("Failed to update role:", e.message);
        }
    }, [user?.id, users, updateUser, showToast]);

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
                                                id={`plan-${managedUser.id}`}
                                                value={managedUser.plan}
                                                onChange={(e) => handlePlanChange(managedUser.id, e.target.value as User['plan'])}
                                                className="w-full bg-gray-800 border border-gray-600 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple"
                                            >
                                                <option value="free">Free</option>
                                                <option value="starter">Starter</option>
                                                <option value="pro">Pro</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                id={`role-${managedUser.id}`}
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

export default React.memo(AdminDashboard);