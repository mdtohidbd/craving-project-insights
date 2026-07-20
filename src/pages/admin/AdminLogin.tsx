import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ChefHat, Loader2, AlertCircle, CheckCircle2, Shield, Briefcase, Calculator, Coffee, Truck } from 'lucide-react';

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

    const handleQuickLogin = async (u: string, p: string) => {
        setUsername(u);
        setPassword(p);
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        try {
            const loggedUser = await login(u, p);
            if (loggedUser.role === 'superadmin' || (loggedUser.allowedModules && loggedUser.allowedModules.includes('dashboard'))) {
                navigate('/admin');
            } else if (loggedUser.allowedModules && loggedUser.allowedModules.length > 0) {
                navigate(`/admin/${loggedUser.allowedModules[0]}`);
            } else {
                navigate('/admin');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-amber-50/30 to-neutral-100 p-4 overflow-y-auto relative">
            {/* Top-left Back Button */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
                <Link 
                    to="/" 
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-neutral-200/60 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-white text-neutral-600 hover:text-primary transition-all duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    <span className="text-sm font-bold tracking-wide">{t("pos.back", "Back")}</span>
                </Link>
            </div>

            <div className="w-full max-w-md mx-auto my-auto py-8">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-[12px] bg-primary shadow-xl shadow-primary/25 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ChefHat className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-neutral-900">{t("pos.skybridge_panel", "Skybridge Panel")}</h1>
                    <p className="text-sm text-neutral-500 mt-1">{t("pos.restaurant_management_system", "Restaurant Management System")}</p>
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

                    {/* Quick Login / Demo Roles */}
                    {mode === 'login' && (
                        <div className="mt-8 border-t border-neutral-200/60 pt-6">
                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider text-center mb-4">
                                Quick Login (Demo)
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Admin', user: 'admin123', pass: 'password123', icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50', hover: 'hover:border-rose-300 hover:shadow-rose-100', border: 'border-rose-100' },
                                    { label: 'Manager', user: 'manager123', pass: 'password123', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:border-blue-300 hover:shadow-blue-100', border: 'border-blue-100' },
                                    { label: 'Cashier', user: 'cashier123', pass: 'password123', icon: Calculator, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:border-emerald-300 hover:shadow-emerald-100', border: 'border-emerald-100' },
                                    { label: 'Chef', user: 'chef123', pass: 'password123', icon: ChefHat, color: 'text-orange-600', bg: 'bg-orange-50', hover: 'hover:border-orange-300 hover:shadow-orange-100', border: 'border-orange-100' },
                                    { label: 'Waiter', user: 'waiter123', pass: 'password123', icon: Coffee, color: 'text-purple-600', bg: 'bg-purple-50', hover: 'hover:border-purple-300 hover:shadow-purple-100', border: 'border-purple-100' },
                                    { label: 'Delivery', user: 'delivery123', pass: 'password123', icon: Truck, color: 'text-cyan-600', bg: 'bg-cyan-50', hover: 'hover:border-cyan-300 hover:shadow-cyan-100', border: 'border-cyan-100' },
                                ].map((role) => {
                                    const Icon = role.icon;
                                    return (
                                        <button
                                            key={role.user}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleQuickLogin(role.user, role.pass);
                                            }}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border ${role.bg} ${role.border} ${role.hover} transition-all duration-300 hover:-translate-y-1 hover:shadow-md group`}
                                        >
                                            <div className={`p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform ${role.color}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className={`text-[11px] font-extrabold tracking-wide uppercase ${role.color}`}>
                                                {role.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-neutral-400 mt-6">
                    <Link to="/" className="hover:text-primary transition-colors">{t("pos.back_to_website", "← Back to website")}</Link>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
