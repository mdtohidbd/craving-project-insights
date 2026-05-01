import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ChefHat, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

type Mode = 'login' | 'register';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const [mode, setMode] = useState<Mode>('login');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        try {
            if (mode === 'login') {
                const loggedUser = await login(username, password);
                if (loggedUser.role === 'superadmin' || (loggedUser.allowedModules && loggedUser.allowedModules.includes('dashboard'))) {
                    navigate('/admin');
                } else if (loggedUser.allowedModules && loggedUser.allowedModules.length > 0) {
                    navigate(`/admin/${loggedUser.allowedModules[0]}`);
                } else {
                    navigate('/admin');
                }
            } else {
                const result = await register(name, username, phone, email, password);
                if (result.message.toLowerCase().includes('pending')) {
                    setSuccessMsg(result.message);
                    setMode('login');
                } else {
                    navigate('/admin');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-amber-50/30 to-neutral-100 p-4">
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-[12px] bg-primary shadow-xl shadow-primary/25 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ChefHat className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-neutral-900">Skybridge Panel</h1>
                    <p className="text-sm text-neutral-500 mt-1">Restaurant Management System</p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-md border border-neutral-200/60 rounded-[12px] shadow-xl p-8">
                    {/* Tab Switch */}
                    <div className="flex gap-1 bg-neutral-100 p-1 rounded-[8px] mb-6">
                        {(['login', 'register'] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(null); setSuccessMsg(null); }}
                                className={`flex-1 py-2 rounded-[4px] text-sm font-semibold transition-all duration-200 ${mode === m
                                    ? 'bg-white shadow text-neutral-900'
                                    : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    {/* Success Banner */}
                    {successMsg && (
                        <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/30 rounded-[8px] mb-4 text-sm text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                            {successMsg}
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-[8px] mb-4 text-sm text-rose-800">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Your full name"
                                    className="w-full px-4 py-2.5 rounded-[8px] border border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="admin123"
                                className="w-full px-4 py-2.5 rounded-[8px] border border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                            />
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    placeholder="01XXXXXXXXX"
                                    className="w-full px-4 py-2.5 rounded-[8px] border border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        )}

                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@restaurant.com"
                                    className="w-full px-4 py-2.5 rounded-[8px] border border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 pr-11 rounded-[8px] border border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 rounded-[8px] bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {mode === 'register' && (
                        <p className="text-xs text-neutral-400 text-center mt-4">
                            After registering, your account requires approval by a superadmin before you can access the panel.
                        </p>
                    )}
                </div>

                <p className="text-center text-xs text-neutral-400 mt-6">
                    <Link to="/" className="hover:text-primary transition-colors">← Back to website</Link>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
