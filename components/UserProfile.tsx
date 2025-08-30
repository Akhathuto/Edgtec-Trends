import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Star, Shield } from './Icons';

interface UserProfileProps {
    onUpgradeClick: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-semibold text-gray-200 text-lg">{value}</p>
    </div>
);

const UserProfile: React.FC<UserProfileProps> = ({ onUpgradeClick }) => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const getPlanStyles = () => {
        switch(user.plan) {
            case 'pro': return 'bg-yellow-500/20 text-yellow-300';
            case 'starter': return 'bg-blue-500/20 text-blue-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-dark-card border border-gray-700 rounded-xl p-8 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto">
                <div className="flex flex-col items-center sm:flex-row sm:items-start text-center sm:text-left">
                    <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
                        <UserIcon className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                        <p className="text-gray-400">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2 justify-center sm:justify-start">
                            <span className={`inline-block font-bold text-sm px-3 py-1 rounded-full ${getPlanStyles()}`}>
                                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                            </span>
                             {user.role === 'admin' && (
                                <span className="inline-flex items-center gap-1.5 font-bold text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                                    <Shield className="w-4 h-4" />
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-700 pt-6 space-y-4">
                    <DetailItem label="User ID" value={user.id} />
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button className="w-full bg-gray-700 hover:bg-gray-600 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            Edit Profile (Coming Soon)
                        </button>
                        {user.plan !== 'pro' && (
                             <button 
                                onClick={onUpgradeClick}
                                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                <Star className="w-5 h-5"/> View Upgrade Options
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;