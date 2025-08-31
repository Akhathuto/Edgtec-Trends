
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Sliders, User as UserIcon, Activity, Lightbulb, Star, Video, Search, MessageSquare } from './Icons';
import { useToast } from '../contexts/ToastContext';

const mockActivities = [
    { user: 'Alice', action: 'generated 3 content ideas for "Retro Gaming"', time: '2m ago', icon: <Lightbulb className="w-4 h-4 text-violet-300"/> },
    { user: 'Bob', action: 'upgraded to the Pro plan', time: '5m ago', icon: <Star className="w-4 h-4 text-yellow-300"/> },
    { user: 'Charlie', action: 'generated a video about "Space Exploration"', time: '12m ago', icon: <Video className="w-4 h-4 text-red-300"/> },
    { user: 'Alice', action: 'researched the keyword "AI Tools"', time: '25m ago', icon: <Search className="w-4 h-4 text-blue-300"/> },
    { user: 'David', action: 'signed up for the Starter plan', time: '1h ago', icon: <UserIcon className="w-4 h-4 text-green-300"/> },
    { user: 'Bob', action: 'chatted with Nolo', time: '2h ago', icon: <MessageSquare className="w-4 h-4 text-cyan-300"/> },
];

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
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-3">
                    <Sliders className="w-6 h-6 text-violet-400" /> Admin Dashboard
                </h2>

                <section>
                    <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2">User Management</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Plan</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {users.map((managedUser) => (
                                    <tr key={managedUser.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center">
                                                    <UserIcon className="h-6 w-6 text-slate-400"/>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">{managedUser.name}</div>
                                                    <div className="text-sm text-slate-400">{managedUser.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                id={`plan-${managedUser.id}`}
                                                value={managedUser.plan}
                                                onChange={(e) => handlePlanChange(managedUser.id, e.target.value as User['plan'])}
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-light transition-colors"
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
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            
             <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                 <section>
                    <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                        <Activity className="w-5 h-5" /> Recent Activity (Simulated)
                    </h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                         {mockActivities.map((activity, index) => (
                            <div key={index} className="flex items-center text-sm p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/50">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3 flex-shrink-0">
                                    {activity.icon}
                                </div>
                                <p className="text-slate-300 flex-grow">
                                    <span className="font-bold text-white">{activity.user}</span> {activity.action}.
                                </p>
                                <span className="text-xs text-slate-500 ml-auto flex-shrink-0 pl-2">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </section>
             </div>
        </div>
    );
};

export default React.memo(AdminDashboard);
