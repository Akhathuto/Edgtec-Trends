
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User, ActivityLog } from '../types.ts';
import { Sliders, User as UserIcon, Activity, Lightbulb, Star, Video, Search, MessageSquare, Trash2, Edit } from './Icons.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { formatDistanceToNow } from 'date-fns';

const iconMap: { [key: string]: React.ReactNode } = {
    Lightbulb: <Lightbulb className="w-4 h-4 text-violet-300" />,
    Star: <Star className="w-4 h-4 text-yellow-300" />,
    Video: <Video className="w-4 h-4 text-red-300" />,
    Search: <Search className="w-4 h-4 text-blue-300" />,
    User: <UserIcon className="w-4 h-4 text-green-300" />,
    MessageSquare: <MessageSquare className="w-4 h-4 text-cyan-300" />,
    Trash2: <Trash2 className="w-4 h-4 text-red-400" />,
    Edit: <Edit className="w-4 h-4 text-slate-300" />,
};

const AdminDashboard: React.FC = () => {
    const { user, getAllUsers, updateUser, getAllActivities, deleteUser } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

    const refreshData = useCallback(() => {
        if (user?.role === 'admin') {
            setUsers(getAllUsers());
            setActivities(getAllActivities());
        }
    }, [user?.role, getAllUsers, getAllActivities]);
    
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handlePlanChange = useCallback((userId: string, newPlan: User['plan']) => {
        try {
            const userToUpdate = users.find(u => u.id === userId);
            if (!userToUpdate) return;
            
            updateUser(userId, { plan: newPlan });
            refreshData(); // Refresh all data to keep it in sync
            showToast(`Updated ${userToUpdate.name}'s plan to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}.`);
        } catch (e: any) {
            showToast(e.message);
            console.error("Failed to update plan:", e.message);
        }
    }, [users, updateUser, showToast, refreshData]);

    const handleRoleChange = useCallback((userId: string, newRole: 'admin' | 'user') => {
        if (user?.id === userId && newRole === 'user') {
            alert("You cannot remove your own admin role.");
            return;
        }
        try {
            const userToUpdate = users.find(u => u.id === userId);
            if (!userToUpdate) return;

            updateUser(userId, { role: newRole });
            refreshData();
            showToast(`Updated ${userToUpdate.name}'s role to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}.`);
        } catch (e: any) {
             showToast(e.message);
             console.error("Failed to update role:", e.message);
        }
    }, [user?.id, users, updateUser, showToast, refreshData]);

    const handleDeleteUser = useCallback((userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return;

        if (window.confirm(`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`)) {
            try {
                deleteUser(userId);
                refreshData();
                showToast(`User ${userToDelete.name} has been deleted.`);
            } catch (e: any) {
                alert(e.message);
            }
        }
    }, [users, deleteUser, showToast, refreshData]);
    
    const stats = useMemo(() => {
        const planCounts = users.reduce((acc, u) => {
            acc[u.plan] = (acc[u.plan] || 0) + 1;
            return acc;
        }, {} as Record<User['plan'], number>);
        return {
            total: users.length,
            free: planCounts.free || 0,
            starter: planCounts.starter || 0,
            pro: planCounts.pro || 0,
        }
    }, [users]);

    if (user?.role !== 'admin') {
        return <p className="text-center text-red-400">Access Denied. This area is for admins only.</p>;
    }

    return (
        <div className="animate-slide-in-up space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-center mb-1 flex items-center justify-center gap-3">
                    <Sliders className="w-8 h-8 text-violet-400" /> Admin Dashboard
                </h2>
                <p className="text-center text-slate-400">Manage users and monitor platform activity.</p>
            </div>
            
             <div className="flex justify-center mb-6">
                <div className="flex bg-slate-800/60 p-1.5 rounded-full border border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center justify-center gap-2 py-2 px-6 text-sm font-semibold rounded-full transition-colors ${activeTab === 'overview' ? 'bg-violet text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                    >
                        <Activity className="w-5 h-5" /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center justify-center gap-2 py-2 px-6 text-sm font-semibold rounded-full transition-colors ${activeTab === 'users' ? 'bg-violet text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                    >
                        <UserIcon className="w-5 h-5" /> User Management
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                 <div className="space-y-8 animate-fade-in">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-5 shadow-xl">
                            <h4 className="text-sm font-medium text-slate-400">Total Users</h4>
                            <p className="text-3xl font-bold text-white">{stats.total}</p>
                        </div>
                         <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-5 shadow-xl">
                            <h4 className="text-sm font-medium text-slate-400">Free Plan</h4>
                            <p className="text-3xl font-bold text-white">{stats.free}</p>
                        </div>
                         <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-5 shadow-xl">
                            <h4 className="text-sm font-medium text-slate-400">Starter Plan</h4>
                            <p className="text-3xl font-bold text-white">{stats.starter}</p>
                        </div>
                         <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-5 shadow-xl">
                            <h4 className="text-sm font-medium text-slate-400">Pro Plan</h4>
                            <p className="text-3xl font-bold text-white">{stats.pro}</p>
                        </div>
                    </div>
                     {/* Activity Feed */}
                    <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                        <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                            <Activity className="w-5 h-5" /> Live Activity Feed
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {activities.length > 0 ? activities.map((activity) => (
                                <div key={activity.id} className="flex items-center text-sm p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/50">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3 flex-shrink-0">
                                        {iconMap[activity.icon] || <Activity className="w-4 h-4 text-slate-300"/>}
                                    </div>
                                    <p className="text-slate-300 flex-grow">
                                        <span className="font-bold text-white">{activity.userName}</span> {activity.action}.
                                    </p>
                                    <span className="text-xs text-slate-500 ml-auto flex-shrink-0 pl-2" title={new Date(activity.timestamp).toLocaleString()}>
                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                            )) : <p className="text-slate-500 text-center py-4">No recent activity.</p>}
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'users' && (
                <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
                    <section>
                        <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2">All Users</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Plan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
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
                                                    defaultValue={managedUser.plan}
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
                                                    defaultValue={managedUser.role}
                                                    onChange={(e) => handleRoleChange(managedUser.id, e.target.value as 'admin' | 'user')}
                                                    disabled={user?.id === managedUser.id}
                                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteUser(managedUser.id)}
                                                    disabled={user?.id === managedUser.id}
                                                    className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                                    title={user?.id === managedUser.id ? "Cannot delete yourself" : "Delete user"}
                                                >
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default React.memo(AdminDashboard);