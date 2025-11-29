import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UtrendLogo } from './Logo';
import Spinner from './Spinner';
import { User } from '../types';
import ErrorDisplay from './ErrorDisplay';
import { Eye, EyeOff, CheckCircle } from './Icons';

// Simple inline alert icon since AlertCircle is not exported
const AlertCircle: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

interface PasswordValidation {
    isValid: boolean;
    strength: 'weak' | 'fair' | 'good' | 'strong';
    requirements: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        numbers: boolean;
        special: boolean;
    };
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
}

const validatePassword = (password: string): PasswordValidation => {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';

    if (metRequirements >= 5) strength = 'strong';
    else if (metRequirements >= 4) strength = 'good';
    else if (metRequirements >= 3) strength = 'fair';

    return {
        isValid: requirements.length && requirements.uppercase && requirements.lowercase && requirements.numbers,
        strength,
        requirements,
    };
};

const PasswordStrengthIndicator: React.FC<{ validation: PasswordValidation }> = ({ validation }) => {
    const strengthColors = {
        weak: 'bg-red-500',
        fair: 'bg-orange-500',
        good: 'bg-yellow-500',
        strong: 'bg-green-500',
    };

    const strengthText = {
        weak: 'Weak',
        fair: 'Fair',
        good: 'Good',
        strong: 'Strong',
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Password Strength</span>
                <span className={`text-xs font-semibold ${strengthColors[validation.strength].replace('bg-', 'text-')}`}>
                    {strengthText[validation.strength]}
                </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full transition-all ${strengthColors[validation.strength]}`}
                    style={{ width: `${(Object.values(validation.requirements).filter(Boolean).length / 5) * 100}%` }}
                />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
                {Object.entries(validation.requirements).map(([req, met]) => (
                    <div key={req} className="flex items-center gap-2 text-xs">
                        {met ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span className={met ? 'text-slate-300' : 'text-slate-500'}>
                            {req === 'length' && '8+ characters'}
                            {req === 'uppercase' && 'Uppercase'}
                            {req === 'lowercase' && 'Lowercase'}
                            {req === 'numbers' && 'Numbers'}
                            {req === 'special' && 'Special char'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Login: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [plan, setPlan] = useState<User['plan']>('free');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const { login, signUp } = useAuth();

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!isLoginView && !name.trim()) {
            errors.name = 'Full name is required';
        }

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!isLoginView) {
            const validation = validatePassword(password);
            if (!validation.isValid) {
                errors.password = 'Password does not meet requirements';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

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

    const passwordValidation = !isLoginView ? validatePassword(password) : { isValid: true, strength: 'weak' as const, requirements: { length: false, uppercase: false, lowercase: false, numbers: false, special: false } };

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
                                <label htmlFor="name" className="text-sm text-slate-400 block mb-2">Full Name *</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                                    }}
                                    placeholder="Enter your full name"
                                    className={`w-full bg-slate-700 border rounded-lg p-3 text-white placeholder-slate-500 transition-colors ${
                                        formErrors.name ? 'border-red-500 bg-red-500/5' : 'border-slate-600 focus:border-violet-500'
                                    } focus:outline-none form-input`}
                                />
                                {formErrors.name && (
                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {formErrors.name}
                                    </p>
                                )}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="text-sm text-slate-400 block mb-2">Email *</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                                }}
                                placeholder="Enter your email address"
                                className={`w-full bg-slate-700 border rounded-lg p-3 text-white placeholder-slate-500 transition-colors ${
                                    formErrors.email ? 'border-red-500 bg-red-500/5' : 'border-slate-600 focus:border-violet-500'
                                } focus:outline-none form-input`}
                            />
                            {formErrors.email && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {formErrors.email}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm text-slate-400 block mb-2">Password *</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                                    }}
                                    placeholder={isLoginView ? 'Enter your password' : 'Create a strong password'}
                                    className={`w-full bg-slate-700 border rounded-lg p-3 pr-10 text-white placeholder-slate-500 transition-colors ${
                                        formErrors.password ? 'border-red-500 bg-red-500/5' : 'border-slate-600 focus:border-violet-500'
                                    } focus:outline-none form-input`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {formErrors.password && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {formErrors.password}
                                </p>
                            )}
                            {!isLoginView && password && (
                                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                                    <PasswordStrengthIndicator validation={passwordValidation} />
                                </div>
                            )}
                        </div>

                        {!isLoginView && (
                             <div>
                                <label className="text-sm text-slate-400 block mb-2">Choose a plan *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPlan('free')}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                            plan === 'free'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                    >
                                        Free
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPlan('pro')}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                            plan === 'pro'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                    >
                                        Pro
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPlan('enterprise')}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                            plan === 'enterprise'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                    >
                                        Enterprise
                                    </button>
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
                        <button 
                            onClick={() => { 
                                setIsLoginView(!isLoginView); 
                                setError(null);
                                setFormErrors({});
                                setName('');
                                setEmail('');
                                setPassword('');
                                setShowPassword(false);
                            }} 
                            className="font-semibold text-violet-400 hover:text-violet-300 ml-2"
                        >
                            {isLoginView ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
             </div>
        </div>
    );
};

export default Login;