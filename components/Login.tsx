import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EdgTecLogo } from './Logo';
import Spinner from './Spinner';

const Login: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [plan, setPlan] = useState<'free' | 'pro'>('free');
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex flex-col justify-center items-center p-4">
             <div className="w-full max-w-md">
                <div className="text-center mb-8">
                     <EdgTecLogo className="h-16 inline-block" />
                     <h1 className="text-3xl font-bold mt-2">Welcome to EdgTec Trends</h1>
                     <p className="text-gray-400">Your AI-powered content assistant.</p>
                </div>
                
                <div className="bg-dark-card border border-gray-700 rounded-xl p-8 shadow-2xl backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-center mb-6">{isLoginView ? 'Sign In' : 'Create Account'}</h2>
                    {error && <p className="bg-red-500/20 text-red-300 text-center text-sm p-3 rounded-lg mb-4">{error}</p>}
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
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
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
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
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
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                            />
                        </div>

                        {!isLoginView && (
                             <div>
                                <label htmlFor="plan" className="sr-only">Choose a plan</label>
                                <select
                                id="plan"
                                value={plan}
                                onChange={(e) => setPlan(e.target.value as 'free' | 'pro')}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                >
                                <option value="free">Freemium (Limited Features)</option>
                                <option value="pro">Pro (Full Access)</option>
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? <Spinner /> : (isLoginView ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-400 mt-6">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-semibold text-purple-400 hover:text-purple-300 ml-2">
                            {isLoginView ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
             </div>
        </div>
    );
};

export default Login;