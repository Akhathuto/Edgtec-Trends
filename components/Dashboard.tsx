import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab, ActivityLog, User } from '../types';
import { Star, TrendingUp, Lightbulb, Video, Activity, Users } from './Icons';
import { formatDistanceToNow } from 'date-fns';

const iconMap: { [key: string]: React.ReactNode } = {
    Lightbulb: <Lightbulb className="w-5 h-5 text-violet-300" />,
    Star: <Star className="w-5 h-5 text-yellow-300" />,
    Video: <Video className="w-5 h-5 text-red-300" />,
    Search: <TrendingUp className="w-5 h-5 text-blue-300" />,
    User: <Users className="w-5 h-5 text-green-300" />,
    MessageSquare: <Lightbulb className="w-5 h-5 text-cyan-300" />,
    Trash2: <Users className="w-5 h-5 text-red-400" />,
    Edit: <Users className="w-5 h-5 text-slate-300" />,
};


interface DashboardProps {
    setActiveTab: (tab: Tab) => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const QuickStartCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
     <button onClick={onClick} className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl w-full text-left transition-all duration-300 hover:border-violet-500 hover:shadow-glow-md hover:-translate-y-1">
        <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-slate-400">{description}</p>
    </button>
);

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
    const { user, getAllActivities } = useAuth();
    const activities = getAllActivities().slice(0, 3); // Get latest 3 activities

    const formatFollowers = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toString();
    };
    
    if (!user) return null;

    return (
        <div className="animate-slide-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-white">Welcome back, {user.name}!</h1>
                <p className="text-slate-400 mt-1">Ready to create something amazing today?</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Current Plan" 
                    value={user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} 
                    icon={<Star className="w-6 h-6 text-yellow-300"/>} 
                />
                <StatCard 
                    title="Followers" 
                    value={user.followerCount ? formatFollowers(user.followerCount) : '-'} 
                    icon={<Users className="w-6 h-6 text-blue-300"/>} 
                />
                 <StatCard 
                    title="Recent Activity" 
                    value={`${activities.length} actions`}
                    icon={<Activity className="w-6 h-6 text-green-300"/>} 
                />
            </div>

            {/* Quick Start */}
             <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-white">Quick Start</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickStartCard
                        title="Find Trends"
                        description="Discover what's currently trending on YouTube & TikTok."
                        icon={<TrendingUp className="w-6 h-6"/>}
                        onClick={() => setActiveTab(Tab.Trends)}
                    />
                     <QuickStartCard
                        title="Generate Ideas"
                        description="Let AI brainstorm your next viral video."
                        icon={<Lightbulb className="w-6 h-6"/>}
                        onClick={() => setActiveTab(Tab.Ideas)}
                    />
                     <QuickStartCard
                        title="Create a Video"
                        description="Generate a stunning video from a text prompt."
                        icon={<Video className="w-6 h-6"/>}
                        onClick={() => setActiveTab(Tab.Video)}
                    />
                 </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Your Recent Activity
                </h3>
                <div className="space-y-3">
                    {activities.length > 0 ? activities.map((activity) => (
                        <div key={activity.id} className="flex items-center text-sm p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/50">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3 flex-shrink-0">
                                {iconMap[activity.icon] || <Activity className="w-4 h-4 text-slate-300"/>}
                            </div>
                            <p className="text-slate-300 flex-grow">
                                You {activity.action}.
                            </p>
                            <span className="text-xs text-slate-500 ml-auto flex-shrink-0 pl-2" title={new Date(activity.timestamp).toLocaleString()}>
                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </span>
                        </div>
                    )) : <p className="text-slate-500 text-center py-4">You haven't performed any actions yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
