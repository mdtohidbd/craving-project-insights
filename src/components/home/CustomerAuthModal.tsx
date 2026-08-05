import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { User, Lock, Mail, Phone, Loader2, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';

interface CustomerAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CustomerAuthModal({ isOpen, onClose }: CustomerAuthModalProps) {
    const { t } = useTranslation();
    const { login, register } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<string>("login");
    const [isLoading, setIsLoading] = useState(false);

    // Login State
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register State
    const [regName, setRegName] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(loginUsername, loginPassword);
            toast({
                title: "Login Successful",
                description: "Welcome back!",
                variant: "default",
            });
            onClose();
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid credentials. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(regName, regUsername, regPhone, regEmail, regPassword);
            toast({
                title: "Registration Successful",
                description: "Your account has been created. Please log in.",
                variant: "default",
            });
            setActiveTab("login");
            setLoginUsername(regUsername);
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "An error occurred during registration.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-neutral-200 shadow-2xl rounded-2xl">
                <div className="p-8 pb-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-serif font-bold text-center text-neutral-900">
                            {activeTab === 'login' ? "Welcome Back" : "Join Skybridge"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-neutral-500">
                            {activeTab === 'login' ? "Enter your credentials to access your account." : "Create an account to track orders and save favorites."}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-neutral-100 p-1 rounded-xl">
                            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Login</TabsTrigger>
                            <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                        </TabsList>

                        {/* LOGIN TAB */}
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-username">Username</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <Input
                                            id="login-username"
                                            placeholder="Enter your username"
                                            className="pl-10 rounded-xl"
                                            value={loginUsername}
                                            onChange={(e) => setLoginUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="login-password">Password</Label>
                                        <span className="text-[11px] text-primary cursor-pointer hover:underline">Forgot password?</span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10 rounded-xl"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-11 mt-6 rounded-xl text-primary-foreground font-bold"
                                    style={{ background: "hsl(43 74% 48%)", color: "hsl(195 30% 8%)" }}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* REGISTER TAB */}
                        <TabsContent value="register">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-name">Full Name</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-neutral-400" />
                                            </div>
                                            <Input
                                                id="reg-name"
                                                placeholder="John Doe"
                                                className="pl-10 rounded-xl"
                                                value={regName}
                                                onChange={(e) => setRegName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-username">Username</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Key className="h-4 w-4 text-neutral-400" />
                                            </div>
                                            <Input
                                                id="reg-username"
                                                placeholder="johndoe123"
                                                className="pl-10 rounded-xl"
                                                value={regUsername}
                                                onChange={(e) => setRegUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reg-email">Email</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <Input
                                            id="reg-email"
                                            type="email"
                                            placeholder="john@example.com"
                                            className="pl-10 rounded-xl"
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reg-phone">Phone Number</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <Input
                                            id="reg-phone"
                                            type="tel"
                                            placeholder="+8801700000000"
                                            className="pl-10 rounded-xl"
                                            value={regPhone}
                                            onChange={(e) => setRegPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">Password</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <Input
                                            id="reg-password"
                                            type="password"
                                            placeholder="Create a password"
                                            className="pl-10 rounded-xl"
                                            value={regPassword}
                                            onChange={(e) => setRegPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-11 mt-6 rounded-xl font-bold"
                                    style={{ background: "hsl(43 74% 48%)", color: "hsl(195 30% 8%)" }}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
