import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UtrendLogo } from './Logo';
import Spinner from './Spinner';
import { User } from '../types';
import ErrorDisplay from './ErrorDisplay';

const Login: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [plan, setPlan] = useState<User['plan']>('free');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login, signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isLoginView) {
                await login(email, password);
            } else {
                await signUp(name, email, password, plan);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-white flex justify-center items-center p-4 animate-fade-in">
             <div className="w-full max-w-md">
                <div className="text-center mb-8">
                     <UtrendLogo className="h-16 inline-block" />
                     <h1 className="text-4xl font-bold mt-4 text-glow">utrend</h1>
                     <p className="text-slate-300">Your AI-powered content suite for creators.</p>
                </div>
                
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-violet-900/30">
                    <h2 className="text-2xl font-bold text-center mb-6 text-glow">{isLoginView ? 'Sign In' : 'Create Account'}</h2>
                    <ErrorDisplay message={error} className="mb-4" />
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLoginView && (
                            <div>
                                <label htmlFor="name" className="sr-only">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full Name"
                                    required
                                    className="form-input"
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                minLength={6}
                                className="form-input"
                            />
                        </div>

                        {!isLoginView && (
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Choose a plan</label>
                                <div className="segmented-control">
                                    <button type="button" onClick={() => setPlan('free')} className={plan === 'free' ? 'active' : ''}>Free</button>
                                    <button type="button" onClick={() => setPlan('starter')} className={plan === 'starter' ? 'active' : ''}>Starter</button>
                                    <button type="button" onClick={() => setPlan('pro')} className={plan === 'pro' ? 'active' : ''}>Pro</button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="button-primary w-full"
                        >
                            {loading ? <Spinner /> : (isLoginView ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>
                    <p className="text-center text-sm text-slate-400 mt-6">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-semibold text-violet-400 hover:text-violet-300 ml-2">
                            {isLoginView ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
             </div>
        </div>
    );
};

export default Login;