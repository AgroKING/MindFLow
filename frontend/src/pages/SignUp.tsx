
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import reactLogo from '../assets/react.svg';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

export function SignUp() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        let strength = 0;
        if (password.length > 5) strength += 1;
        if (password.length > 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    }, [password]);

    const getStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-400';
        if (passwordStrength <= 4) return 'bg-yellow-400';
        return 'bg-green-400';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) return;
        setIsLoading(true);

        try {
            const data = await authService.signup({ email, password, name: fullName });
            setAuth(data.user, data.access_token);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Signup failed:', error);
            // Error is handled globally by api interceptor, but we can add specific handling here if needed
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F7] relative overflow-hidden py-10">
            {/* Background Shapes */}
            <div className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[0%] left-[5%] w-[400px] h-[400px] bg-pink-400/20 rounded-full blur-[80px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[480px] px-4 relative z-10"
            >
                <div className="relative backdrop-blur-xl bg-white/70 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20 p-8 md:p-10">
                    <div className="flex justify-center mb-6">
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            src={reactLogo}
                            alt="MindFlow Logo"
                            className="w-10 h-10"
                        />
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-500 text-sm">Join MindFlow to start your journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
                                placeholder="Full Name"
                            />

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
                                placeholder="Email Address"
                            />

                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 pr-10"
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>

                                {/* Password Strength Meter */}
                                <div className="flex gap-1 mt-2 h-1 px-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-full flex-1 rounded-full transition-all duration-300 ${i < passwordStrength ? getStrengthColor() : 'bg-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-3 bg-white/50 border rounded-xl outline-none focus:ring-1 transition-all placeholder-gray-400 ${confirmPassword && password !== confirmPassword
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                        }`}
                                    placeholder="Confirm Password"
                                />
                                {confirmPassword && password === confirmPassword && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                        <Check size={18} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-500 select-none">
                                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms</a> & <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !agreeTerms || (password !== confirmPassword && confirmPassword.length > 0)}
                            className="w-full mt-4 bg-gray-900 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px bg-gray-200 flex-1" />
                            <span className="text-gray-400 text-xs font-medium uppercase">Or sign up with</span>
                            <div className="h-px bg-gray-200 flex-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Google</span>
                            </button>
                            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.11 3.28-1.57 3.3.49 4.95 2.12 4.95 2.12-2.73 1.64-2.28 4.75.21 5.67-.17.65-.4 1.34-.82 2.13-.57 1.25-1.45 2.68-2.7 3.88zM12.93 5.4c-.66-1.12.31-2.91 1.77-3.41.35 1.57-.96 3.12-1.77 3.41z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Apple</span>
                            </button>
                        </div>

                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
