import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Star, Shield, Edit, Save, X, Phone, Users, Link, Youtube, TikTok, Trash2, CheckCircle, Eye, EyeOff } from './Icons';
import { useToast } from '../contexts/ToastContext';
import Spinner from './Spinner';
// Inline AlertCircle icon (Icons.tsx does not export this)
const AlertCircle: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
import { Channel, User } from '../types';
import { getChannelSnapshots } from '../services/geminiService';

interface UserProfileProps {
    onUpgradeClick: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="font-semibold text-slate-200">{value || '-'}</p>
    </div>
);

interface ValidationErrors {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    company?: string;
}

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

const UserProfile: React.FC<UserProfileProps> = ({ onUpgradeClick }) => {
    const { user, updateProfile } = useAuth();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    // State for editable fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [website, setWebsite] = useState('');
    const [bio, setBio] = useState('');
    const [channels, setChannels] = useState<Channel[]>([]);
    
    // State for automated follower count
    const [totalFollowers, setTotalFollowers] = useState<number | null>(null);
    const [followersLoading, setFollowersLoading] = useState(false);

    // State for new channel form
    const [newChannelPlatform, setNewChannelPlatform] = useState<'YouTube' | 'TikTok'>('YouTube');
    const [newChannelUrl, setNewChannelUrl] = useState('');
    const [newChannelError, setNewChannelError] = useState<string | null>(null);
    const [channelErrors, setChannelErrors] = useState<Record<string, string>>({});
    const newChannelRef = React.useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setCountry(user.country || '');
            setPhone(user.phone || '');
            setCompany(user.company || '');
            setWebsite((user as any).website || '');
            setBio((user as any).bio || '');
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

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!name.trim()) {
            errors.name = 'Full name is required';
        }

        if (!validateEmail(email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (phone && !validatePhone(phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        if (country && country.length > 50) {
            errors.country = 'Country name is too long';
        }

        if (company && company.length > 100) {
            errors.company = 'Company name is too long';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!user) return;

        if (!validateForm()) {
            showToast('Please fix the errors in your profile');
            return;
        }

        setLoading(true);
        try {
            if (channels.some(c => !c.url.trim().toLowerCase().startsWith('http'))) {
                showToast('Please enter valid URLs (starting with http) for all channels.');
                setLoading(false);
                return;
            }
            await updateProfile(user.id, { 
                name, 
                email, 
                country, 
                phone, 
                company, 
                channels,
                website,
                bio
            });
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
            setWebsite((user as any).website || '');
            setBio((user as any).bio || '');
            setChannels(user.channels || []);
        }
        setValidationErrors({});
        setIsEditing(false);
    };

    const handleAddChannel = () => {
        if (!newChannelUrl.trim().toLowerCase().startsWith('http')) {
            setNewChannelError('Please enter a valid URL starting with http');
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
        setNewChannelError(null);
        // focus back to url input for quick add
        requestAnimationFrame(() => newChannelRef.current?.focus());
    };

    const handleRemoveChannel = (id: string) => {
        setChannels(prev => prev.filter(c => c.id !== id));
        setChannelErrors(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    };
    
    const handleChannelUrlChange = (id: string, newUrl: string) => {
        setChannels(prev => prev.map(c => c.id === id ? { ...c, url: newUrl } : c));
        // basic inline validation
        if (newUrl && !newUrl.trim().toLowerCase().startsWith('http')) {
            setChannelErrors(prev => ({ ...prev, [id]: 'URL must start with http' }));
        } else {
            setChannelErrors(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
        }
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
                                        <label htmlFor="name" className="text-sm text-slate-400 block mb-2">Full Name *</label>
                                        <input 
                                            id="name" 
                                            type="text" 
                                            value={name} 
                                            onChange={(e) => { setName(e.target.value); if(validationErrors.name) setValidationErrors({...validationErrors, name: undefined}); }} 
                                            className={`w-full bg-slate-700 border rounded-lg p-2.5 mt-1 text-white transition-colors ${validationErrors.name ? 'border-red-500 bg-red-500/5' : 'border-slate-600 focus:border-violet-500'} focus:outline-none`}
                                            title="Your full name"
                                        />
                                        {validationErrors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {validationErrors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="text-sm text-slate-400 block mb-2">Email Address *</label>
                                        <input 
                                            id="email" 
                                            type="email" 
                                            value={email} 
                                            onChange={(e) => { setEmail(e.target.value); if(validationErrors.email) setValidationErrors({...validationErrors, email: undefined}); }} 
                                            className={`w-full bg-slate-700 border rounded-lg p-2.5 mt-1 text-white transition-colors ${validationErrors.email ? 'border-red-500 bg-red-500/5' : 'border-slate-600 focus:border-violet-500'} focus:outline-none`}
                                            title="Your email address"
                                        />
                                        {validationErrors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {validationErrors.email}</p>}
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
                                        <label htmlFor="country" className="text-sm text-slate-400 block mb-2">Country</label>
                                        <input 
                                            id="country" 
                                            type="text" 
                                            value={country} 
                                            onChange={(e) => { setCountry(e.target.value); if(validationErrors.country) setValidationErrors({...validationErrors, country: undefined}); }} 
                                            placeholder="e.g. South Africa" 
                                            className={`w-full bg-slate-700 border rounded-lg p-2.5 mt-1 text-white transition-colors ${validationErrors.country ? 'border-red-500 bg-red-500/5' : 'border-slate-600 focus:border-violet-500'} focus:outline-none`}
                                            title="Your country of residence"
                                        />
                                        {validationErrors.country && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {validationErrors.country}</p>}
                                    </div>
                                     <div>
                                        <label htmlFor="phone" className="text-sm text-slate-400 block mb-2">Phone</label>
                                        <input 
                                            id="phone" 
                                            type="tel" 
                                            value={phone} 
                                            onChange={(e) => { setPhone(e.target.value); if(validationErrors.phone) setValidationErrors({...validationErrors, phone: undefined}); }} 
                                            placeholder="e.g. +27..." 
                                            className={`w-full bg-slate-700 border rounded-lg p-2.5 mt-1 text-white transition-colors ${validationErrors.phone ? 'border-red-500 bg-red-500/5' : 'border-slate-600 focus:border-violet-500'} focus:outline-none`}
                                            title="Your phone number (optional)"
                                        />
                                        {validationErrors.phone && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {validationErrors.phone}</p>}
                                    </div>
                                     <div>
                                        <label htmlFor="company" className="text-sm text-slate-400 block mb-2">Company/Brand</label>
                                        <input 
                                            id="company" 
                                            type="text" 
                                            value={company} 
                                            onChange={(e) => { setCompany(e.target.value); if(validationErrors.company) setValidationErrors({...validationErrors, company: undefined}); }} 
                                            placeholder="e.g. EDGTEC" 
                                            className={`w-full bg-slate-700 border rounded-lg p-2.5 mt-1 text-white transition-colors ${validationErrors.company ? 'border-red-500 bg-red-500/5' : 'border-slate-600 focus:border-violet-500'} focus:outline-none`}
                                            title="Your company or brand name (optional)"
                                        />
                                        {validationErrors.company && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {validationErrors.company}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="website" className="text-sm text-slate-400 block mb-2">Website</label>
                                        <input 
                                            id="website" 
                                            type="url" 
                                            value={website} 
                                            onChange={(e) => setWebsite(e.target.value)} 
                                            placeholder="https://example.com" 
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 mt-1 text-white focus:border-violet-500 focus:outline-none transition-colors"
                                            title="Your personal or business website (optional)"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="bio" className="text-sm text-slate-400 block mb-2">Bio</label>
                                        <textarea 
                                            id="bio" 
                                            value={bio} 
                                            onChange={(e) => setBio(e.target.value)} 
                                            placeholder="Tell us about yourself..." 
                                            rows={3}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 mt-1 text-white focus:border-violet-500 focus:outline-none transition-colors resize-none"
                                            title="Your bio or creator description (optional)"
                                        />
                                        <p className="text-slate-500 text-xs mt-1">{bio.length}/500 characters</p>
                                    </div>
                                </>
                            ) : (
                                 <>
                                    <DetailItem label="Country" value={user.country} />
                                    <DetailItem label="Phone" value={user.phone} />
                                    <DetailItem label="Company/Brand" value={user.company} />
                                    <DetailItem label="Website" value={(user as any).website ? <a href={(user as any).website} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">{(user as any).website}</a> : undefined} />
                                    {(user as any).bio && <DetailItem label="Bio" value={<p className="text-sm text-slate-300">{(user as any).bio}</p>} className="md:col-span-2" />}
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
                                        <div className="flex-1">
                                            <input type="url" value={channel.url} onChange={(e) => handleChannelUrlChange(channel.id, e.target.value)} placeholder="https://..." className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white" title={`Edit URL for ${channel.url.split('/').pop()}`}/>
                                            {channelErrors[channel.id] && <p className="text-red-400 text-xs mt-1">{channelErrors[channel.id]}</p>}
                                        </div>
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
                                        <div className="flex-1">
                                            <input ref={newChannelRef} type="url" value={newChannelUrl} onChange={(e) => { setNewChannelUrl(e.target.value); if (newChannelError) setNewChannelError(null); }} placeholder="Enter new channel URL..." className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white" title="Enter the full URL of the new channel"/>
                                            {newChannelError && <p className="text-red-400 text-xs mt-1">{newChannelError}</p>}
                                        </div>
                                        <button onClick={handleAddChannel} className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 font-semibold text-white px-4 py-2 rounded-lg transition-colors" title="Add the new channel to your profile">Add</button>
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