
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User as UserIcon, Star, Shield, Edit, Save, X, Phone, Users, Link, Youtube, TikTok, Trash2 } from './Icons.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import Spinner from './Spinner.tsx';
import { Channel } from '../types.ts';
import { getChannelSnapshots } from '../services/geminiService.ts';

interface UserProfileProps {
    onUpgradeClick: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="font-semibold text-slate-200">{value || '-'}</p>
    </div>
);

const UserProfile: React.FC<UserProfileProps> = ({ onUpgradeClick }) => {
    const { user, updateProfile } = useAuth();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // State for editable fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [channels, setChannels] = useState<Channel[]>([]);
    
    // State for automated follower count
    const [totalFollowers, setTotalFollowers] = useState<number | null>(null);
    const [followersLoading, setFollowersLoading] = useState(false);

    // State for new channel form
    const [newChannelPlatform, setNewChannelPlatform] = useState<'YouTube' | 'TikTok'>('YouTube');
    const [newChannelUrl, setNewChannelUrl] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setCountry(user.country || '');
            setPhone(user.phone || '');
            setCompany(user.company || '');
            setChannels(user.channels || []);
        }
    }, [user]);

    const parseFollowerCount = (countStr: string): number => {
        if (!countStr || typeof countStr !== 'string') return 0;
        const lowerCaseCount = countStr.toLowerCase().replace(/,/g, '');
        const num = parseFloat(lowerCaseCount);
        if (isNaN(num)) return 0;

        if (lowerCaseCount.includes('m')) {
            return Math.round(num * 1000000);
        }
        if (lowerCaseCount.includes('k')) {
            return Math.round(num * 1000);
        }
        return Math.round(num);
    };

    useEffect(() => {
        const calculateTotalFollowers = async () => {
            if (channels.length === 0) {
                setTotalFollowers(0);
                return;
            }
            
            setFollowersLoading(true);
            try {
                const snapshots = await getChannelSnapshots(channels);
                const total = snapshots.reduce((acc, snapshot) => {
                    return acc + parseFollowerCount(snapshot.followerCount);
                }, 0);
                setTotalFollowers(total);
            } catch (error) {
                console.error("Failed to fetch channel snapshots for follower count", error);
                setTotalFollowers(null);
                showToast("Could not fetch follower counts.");
            } finally {
                setFollowersLoading(false);
            }
        };

        calculateTotalFollowers();
    }, [channels, showToast]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (channels.some(c => !c.url.trim().toLowerCase().startsWith('http'))) {
                showToast('Please enter valid URLs (starting with http) for all channels.');
                setLoading(false);
                return;
            }
            await updateProfile(user.id, { name, email, country, phone, company, channels });
            showToast('Profile updated successfully!');
            setIsEditing(false);
        } catch (e: any) {
            showToast(e.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancel = () => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setCountry(user.country || '');
            setPhone(user.phone || '');
            setCompany(user.company || '');
            setChannels(user.channels || []);
        }
        setIsEditing(false);
    };

    const handleAddChannel = () => {
        if (!newChannelUrl.trim().toLowerCase().startsWith('http')) {
            showToast('Please enter a valid channel URL starting with http.');
            return;
        }
        const newChannel: Channel = {
            id: Date.now().toString(),
            platform: newChannelPlatform,
            url: newChannelUrl
        };
        setChannels(prev => [...prev, newChannel]);
        setNewChannelUrl('');
        setNewChannelPlatform('YouTube');
    };

    const handleRemoveChannel = (id: string) => {
        setChannels(prev => prev.filter(c => c.id !== id));
    };
    
    const handleChannelUrlChange = (id: string, newUrl: string) => {
        setChannels(prev => prev.map(c => c.id === id ? { ...c, url: newUrl } : c));
    };
    
    const handleChannelPlatformChange = (id: string, newPlatform: 'YouTube' | 'TikTok') => {
         setChannels(prev => prev.map(c => c.id === id ? { ...c, platform: newPlatform } : c));
    };

    if (!user) return null;

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                    <div>
                         <h2 className="text-3xl font-bold text-center sm:text-left mb-1 flex items-center gap-3">
                            <UserIcon className="w-8 h-8 text-violet-400" /> My Profile
                        </h2>
                        <p className="text-center sm:text-left text-slate-400">View and manage your account details.</p>
                    </div>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-4 sm:mt-0 w-full sm:w-auto justify-center" title="Enable editing of your profile details">
                            <Edit className="w-4 h-4" /> Edit Profile
                        </button>
                    ) : (
                         <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                            <button onClick={handleCancel} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full justify-center" title="Discard changes and exit edit mode">
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 text-sm bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 w-full justify-center" title="Save your profile changes">
                                {loading ? <Spinner size="sm" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Account Info */}
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                         <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2">Account Information</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label htmlFor="name" className="text-sm text-slate-400">Full Name</label>
                                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 mt-1 text-white" title="Your full name"/>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="text-sm text-slate-400">Email Address</label>
                                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 mt-1 text-white" title="Your email address"/>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <DetailItem label="Full Name" value={user.name} />
                                    <DetailItem label="Email Address" value={user.email} />
                                </>
                            )}
                            <DetailItem label="Current Plan" value={<span className="font-bold text-yellow-300 flex items-center gap-2">{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} <Star className="w-4 h-4"/></span>} />
                            {user.role === 'admin' && <DetailItem label="Role" value={<span className="font-bold text-green-400 flex items-center gap-2">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} <Shield className="w-4 h-4"/></span>} />}
                         </div>
                    </div>
                    
                    {/* Creator Details */}
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                         <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2">Creator Details</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {isEditing ? (
                                <>
                                    <div>
                                        <label htmlFor="country" className="text-sm text-slate-400">Country</label>
                                        <input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. South Africa" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 mt-1 text-white" title="Your country of residence"/>
                                    </div>
                                     <div>
                                        <label htmlFor="phone" className="text-sm text-slate-400">Phone</label>
                                        <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +27..." className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 mt-1 text-white" title="Your phone number (optional)"/>
                                    </div>
                                     <div>
                                        <label htmlFor="company" className="text-sm text-slate-400">Company/Brand</label>
                                        <input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. EDGTEC" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 mt-1 text-white" title="Your company or brand name (optional)"/>
                                    </div>
                                </>
                            ) : (
                                 <>
                                    <DetailItem label="Country" value={user.country} />
                                    <DetailItem label="Phone" value={user.phone} />
                                    <DetailItem label="Company/Brand" value={user.company} />
                                 </>
                            )}
                             <DetailItem
                                label="Total Follower Count (Approx.)"
                                value={
                                    followersLoading ? <div className="flex items-center pt-1"><Spinner size="sm" /></div> :
                                    totalFollowers !== null ? totalFollowers.toLocaleString() : 'N/A'
                                }
                            />
                         </div>
                    </div>

                    {/* Connected Channels */}
                     <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                         <h3 className="text-xl font-bold text-violet-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><Link className="w-5 h-5"/> Connected Channels</h3>
                         <div className="space-y-3">
                             {channels.map(channel => (
                                <div key={channel.id} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-900/40 rounded-lg">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <span className="p-2 bg-slate-700 rounded-lg">
                                            {channel.platform === 'YouTube' ? <Youtube className="w-5 h-5 text-red-500" /> : <TikTok className="w-5 h-5 text-white" />}
                                        </span>
                                        {isEditing && (
                                            <select 
                                                value={channel.platform}
                                                onChange={(e) => handleChannelPlatformChange(channel.id, e.target.value as 'YouTube' | 'TikTok')}
                                                className="bg-slate-700 border-slate-600 rounded-lg p-2 text-white"
                                                title={`Change platform for ${channel.url.split('/').pop()}`}
                                            >
                                                <option value="YouTube">YouTube</option>
                                                <option value="TikTok">TikTok</option>
                                            </select>
                                        )}
                                    </div>
                                    {isEditing ? (
                                        <input type="url" value={channel.url} onChange={(e) => handleChannelUrlChange(channel.id, e.target.value)} placeholder="https://..." className="flex-grow w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white" title={`Edit URL for ${channel.url.split('/').pop()}`}/>
                                    ) : (
                                        <p className="flex-grow text-slate-300 truncate text-sm">{channel.url}</p>
                                    )}
                                     {isEditing && (
                                        <button onClick={() => handleRemoveChannel(channel.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full" title={`Remove ${channel.url.split('/').pop()} from your profile`}>
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                     )}
                                </div>
                             ))}
                             {channels.length === 0 && !isEditing && (
                                <p className="text-slate-500 text-center py-2">No channels connected yet.</p>
                             )}
                             {isEditing && (
                                <div className="pt-4 border-t border-slate-700/50">
                                    <h4 className="text-lg font-semibold text-slate-200 mb-2">Add New Channel</h4>
                                    <div className="flex flex-col sm:flex-row items-center gap-2 p-2">
                                        <select value={newChannelPlatform} onChange={(e) => setNewChannelPlatform(e.target.value as 'YouTube' | 'TikTok')} className="bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white" title="Select the platform for the new channel">
                                            <option value="YouTube">YouTube</option>
                                            <option value="TikTok">TikTok</option>
                                        </select>
                                        <input type="url" value={newChannelUrl} onChange={(e) => setNewChannelUrl(e.target.value)} placeholder="Enter new channel URL..." className="flex-grow w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white" title="Enter the full URL of the new channel"/>
                                        <button onClick={handleAddChannel} className="w-full sm:w-auto bg-violet hover:bg-violet-dark font-semibold text-white px-4 py-2 rounded-lg transition-colors" title="Add the new channel to your profile">Add</button>
                                    </div>
                                </div>
                             )}
                         </div>
                     </div>

                </div>
            </div>
        </div>
    );
};

export default UserProfile;
