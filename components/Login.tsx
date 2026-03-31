import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UtrendLogo } from './Logo';
import Spinner from './Spinner';
import { User } from '../types';
import ErrorDisplay from './ErrorDisplay';

export const Login: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [plan, setPlan] = useState<User['plan']>('free');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isPhoneView, setIsPhoneView] = useState(false);
    const [isResetView, setIsResetView] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const { login, signUp, loginWithGoogle, loginWithFacebook, signInWithPhone, verifyOtp, resetPassword } = useAuth();

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            await loginWithFacebook();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isResetView) {
                await resetPassword(email);
                setError("Password reset email sent! Please check your inbox.");
            } else if (isPhoneView) {
                if (otpSent) {
                    await verifyOtp(otp);
                } else {
                    await signInWithPhone(phoneNumber, 'recaptcha-container');
                    setOtpSent(true);
                }
            } else if (isLoginView) {
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
                    <h2 className="text-2xl font-bold text-center mb-6 text-glow">
                        {isResetView ? 'Reset Password' : (isPhoneView ? (otpSent ? 'Verify OTP' : 'Phone Sign In') : (isLoginView ? 'Sign In' : 'Create Account'))}
                    </h2>
                    <ErrorDisplay message={error} className="mb-4" />
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isResetView ? (
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
                        ) : isPhoneView ? (
                            otpSent ? (
                                <div>
                                    <label htmlFor="otp" className="sr-only">OTP Code</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        required
                                        className="form-input"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="phone" className="sr-only">Phone Number</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+1 234 567 8900"
                                        required
                                        className="form-input"
                                    />
                                    <div id="recaptcha-container" className="mt-4"></div>
                                </div>
                            )
                        ) : (
                            <>
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
                                    {isLoginView && (
                                        <div className="flex justify-end mt-1">
                                            <button 
                                                type="button" 
                                                onClick={() => { setIsResetView(true); setError(null); }}
                                                className="text-xs text-violet-400 hover:text-violet-300"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    )}
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
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="button-primary w-full"
                        >
                            {loading ? <Spinner /> : (isResetView ? 'Send Reset Link' : (isPhoneView ? (otpSent ? 'Verify Code' : 'Send Code') : (isLoginView ? 'Sign In' : 'Sign Up')))}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="flex items-center justify-center bg-white text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
                            title="Sign in with Google"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={handleFacebookLogin}
                            disabled={loading}
                            className="flex items-center justify-center bg-[#1877F2] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#166fe5] transition-all disabled:opacity-50"
                            title="Sign in with Facebook"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => { setIsPhoneView(!isPhoneView); setIsResetView(false); setOtpSent(false); setError(null); }}
                            disabled={loading}
                            className="flex items-center justify-center bg-slate-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                            title="Sign in with Phone"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        {(isPhoneView || isResetView) ? "Prefer email?" : (isLoginView ? "Don't have an account?" : "Already have an account?")}
                        <button onClick={() => { 
                            if (isPhoneView || isResetView) {
                                setIsPhoneView(false);
                                setIsResetView(false);
                            } else {
                                setIsLoginView(!isLoginView); 
                            }
                            setError(null); 
                            setOtpSent(false);
                        }} className="font-semibold text-violet-400 hover:text-violet-300 ml-2">
                            {(isPhoneView || isResetView) ? 'Sign In with Email' : (isLoginView ? 'Sign Up' : 'Sign In')}
                        </button>
                    </p>
                </div>
             </div>
        </div>
    );
};

export default Login;