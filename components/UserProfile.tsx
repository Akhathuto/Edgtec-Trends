import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Star, Shield, Edit, Save, X, Phone, Users, Link } from './Icons';
import { useToast } from '../contexts/ToastContext';
import Spinner from './Spinner';

interface UserProfileProps {
    onUpgradeClick: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="font-semibold text-slate-200 text-lg truncate">{value || '-'}</p>
    </div>
);

const UserProfile: React.FC<UserProfileProps> = ({ onUpgradeClick }) => {
    const { user, updateProfile } = useAuth();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [country, setCountry] = useState(user?.country || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [company, setCompany] = useState(user?.company || '');
    const [followerCount, setFollowerCount] = useState(user?.followerCount || 0);
    const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(user?.youtubeChannelUrl || '');

    const resetFormState = () => {
        setName(user?.name || '');
        setEmail(user?.email || '');
        setCountry(user?.country || '');
        setPhone(user?.phone || '');
        setCompany(user?.company || '');
        setFollowerCount(user?.followerCount || 0);
        setYoutubeChannelUrl(user?.youtubeChannelUrl || '');
    };

    useEffect(() => {
       resetFormState();
    }, [user]);

    if (!user) {
        return null;
    }

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setError(null);
        if (isEditing) {
            resetFormState();
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            setError("Name and email cannot be empty.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await updateProfile(user.id, { 
                name, 
                email, 
                country,
                phone,
                company,
                followerCount: Number(followerCount) || 0,
                youtubeChannelUrl,
            });
            showToast("Profile updated successfully!");
            setIsEditing(false);
        } catch (e: any) {
            setError(e.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const getPlanStyles = () => {
        switch(user.plan) {
            case 'pro': return 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20';
            case 'starter': return 'bg-blue-400/10 text-blue-300 border border-blue-400/20';
            default: return 'bg-slate-700/50 text-slate-300 border border-slate-600';
        }
    };
    
    const formatFollowers = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num/1000).toFixed(0)}K`;
      return num;
    };

    const openChannelPopup = () => {
        if (user.youtubeChannelUrl) {
            window.open(user.youtubeChannelUrl, 'youtubeChannel', 'width=900,height=700,noopener,noreferrer');
        }
    };

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-start text-center sm:text-left mb-8">
                    <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-violet-600 to-blue-600 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 ring-4 ring-slate-700/50">
                        <UserIcon className="w-12 h-12 text-white" />
                    </div>
                    <div className="flex-grow">
                        <h2 className="text-3xl font-bold text-white">{isEditing ? name : user.name}</h2>
                        <p className="text-slate-400">{isEditing ? email : user.email}</p>
                        <div className="mt-2 flex items-center gap-2 justify-center sm:justify-start">
                            <span className={`inline-block font-bold text-sm px-3 py-1 rounded-full ${getPlanStyles()}`}>
                                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                            </span>
                             {user.role === 'admin' && (
                                <span className="inline-flex items-center gap-1.5 font-bold text-sm px-3 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/20">
                                    <Shield className="w-4 h-4" />
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                     {!isEditing && (
                         <button onClick={handleEditToggle} className="flex-shrink-0 mt-4 sm:mt-0 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg transition-colors">
                            <Edit className="w-4 h-4"/> Edit Profile
                        </button>
                     )}
                </div>

                <div className="border-t border-slate-700 pt-6">
                    {isEditing ? (
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="profile-name" className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                                    <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
                                </div>
                                 <div>
                                    <label htmlFor="profile-email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                                     <input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
                                </div>
                                <div>
                                    <label htmlFor="profile-company" className="block text-sm font-medium text-slate-300 mb-1">Company / Channel</label>
                                    <input id="profile-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
                                </div>
                                <div>
                                    <label htmlFor="profile-followers" className="block text-sm font-medium text-slate-300 mb-1">Follower Count</label>
                                    <input id="profile-followers" type="number" value={followerCount || ''} onChange={(e) => setFollowerCount(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
                                </div>
                                <div>
                                    <label htmlFor="profile-country" className="block text-sm font-medium text-slate-300 mb-1">Country</label>
                                    <input id="profile-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
                                </div>
                                <div>
                                    <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-300 mb-1">Contact No.</label>
                                    <input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="profile-youtube-url" className="block text-sm font-medium text-slate-300 mb-1">YouTube Channel URL</label>
                                    <input id="profile-youtube-url" type="url" value={youtubeChannelUrl} onChange={(e) => setYoutubeChannelUrl(e.target.value)} placeholder="https://www.youtube.com/c/YourChannel" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DetailItem label="Company / Channel" value={user.company} />
                            <DetailItem label="Follower Count" value={user.followerCount ? formatFollowers(user.followerCount) : '-'} />
                            <DetailItem label="Country" value={user.country} />
                            <DetailItem label="Contact Number" value={user.phone} />
                            <DetailItem label="User ID" value={user.id} />
                            <DetailItem 
                                label="YouTube Channel" 
                                value={user.youtubeChannelUrl ? (
                                    <button onClick={openChannelPopup} className="text-blue-400 hover:underline flex items-center gap-1.5 focus:outline-none">
                                        <Link className="w-4 h-4" />
                                        View Channel
                                    </button>
                                ) : '-'} 
                            />
                        </div>
                    )}
                    
                    {error && <p className="text-red-400 text-center my-4">{error}</p>}
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-slate-700">
                       {isEditing ? (
                           <>
                                <button 
                                    onClick={handleEditToggle}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5"/> Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-violet/30"
                                >
                                    {loading ? <Spinner /> : <><Save className="w-5 h-5"/> Save Changes</>}
                                </button>
                           </>
                       ) : (
                            <>
                                {user.plan !== 'pro' && (
                                     <button 
                                        onClick={onUpgradeClick}
                                        className="w-full flex items-center justify-center gap-2 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 text-yellow-300 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-yellow-400/20"
                                    >
                                        <Star className="w-5 h-5"/> View Upgrade Options
                                    </button>
                                )}
                            </>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;