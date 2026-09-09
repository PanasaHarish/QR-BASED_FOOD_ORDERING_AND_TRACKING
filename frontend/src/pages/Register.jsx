import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsRegistering(true);
        try {
            const { data } = await axios.post('/api/auth/register', { name, email, password });
            toast.success('Registration successful! Logging in...');
            
            await login(email, password);
            navigate('/admin');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-dark py-12 px-4 sm:px-6 lg:px-6 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-amber/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full space-y-8 glass-premium p-8 rounded-2xl shadow-2xl border border-white/10 relative z-10 animate-fade-in-up">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-brand-primary/30 mx-auto animate-float">
                        F
                    </div>
                    <h2 className="mt-6 text-center text-2xl font-extrabold text-white tracking-tight">
                        Create Owner Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-400">
                        Restaurant Management Dashboard
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FaUser className="text-zinc-500" />
                            </div>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3.5 pl-11 bg-zinc-900/50 border border-zinc-800 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent sm:text-sm transition-all duration-200"
                                placeholder="Full Name (e.g., John Doe)"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FaEnvelope className="text-zinc-500" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3.5 pl-11 bg-zinc-900/50 border border-zinc-800 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent sm:text-sm transition-all duration-200"
                                placeholder="Email address"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FaLock className="text-zinc-500" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-3 py-3.5 pl-11 bg-zinc-900/50 border border-zinc-800 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent sm:text-sm transition-all duration-200"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isRegistering}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                        >
                            {isRegistering ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                    
                    <div className="text-center mt-6 pt-5 border-t border-white/5">
                        <span className="text-sm text-zinc-400">Already have an account? </span>
                        <Link to="/login" className="text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
