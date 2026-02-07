
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import reactLogo from '../assets/react.svg'; // Using react logo as placeholder
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await authService.login({ username: email, password }); // detailed payload depends on backend
            setAuth(data.user, data.access_token);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login failed:', err);
            // If the global interceptor doesn't catch it or we want inline error
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F7] relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[80px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[450px] p-8 md:p-12 relative z-10"
            >
                <div className="relative backdrop-blur-xl bg-white/70 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20 p-8 md:p-10 overflow-hidden">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            src={reactLogo}
                            alt="MindFlow Logo"
                            className="w-12 h-12"
                        />
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-500 text-sm">Sign in to continue your journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <div className="relative group">
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="peer w-full px-4 pt-6 pb-2 bg-white/50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-transparent"
                                    placeholder="Email"
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-4 top-4 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500 pointer-events-none"
                                >
                                    Email
                                </label>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="peer w-full px-4 pt-6 pb-2 bg-white/50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-transparent pr-10"
                                    placeholder="Password"
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-4 top-4 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-blue-500 pointer-events-none"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="flex justify-end pt-1">
                                <Link to="/forgot-password" className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-500 text-sm text-center bg-red-50/50 py-2 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px bg-gray-200 flex-1" />
                        <span className="text-gray-400 text-xs font-medium uppercase">Or</span>
                        <div className="h-px bg-gray-200 flex-1" />
                    </div>

                    <button className="w-full bg-white border border-gray-200 text-gray-900 font-medium py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 group">
                        {/* Apple Logo SVG */}
                        <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.11 3.28-1.57 3.3.49 4.95 2.12 4.95 2.12-2.73 1.64-2.28 4.75.21 5.67-.17.65-.4 1.34-.82 2.13-.57 1.25-1.45 2.68-2.7 3.88zM12.93 5.4c-.66-1.12.31-2.91 1.77-3.41.35 1.57-.96 3.12-1.77 3.41z" />
                        </svg>
                        <span className="group-hover:opacity-80 transition-opacity">Sign in with Apple</span>
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-blue-600 font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
