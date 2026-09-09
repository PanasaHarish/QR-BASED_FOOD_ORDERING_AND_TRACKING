import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaUtensils, FaClipboardList, FaSignOutAlt, FaBullhorn, FaWallet, FaTimesCircle, FaStar } from 'react-icons/fa';

const OwnerLayout = () => {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <FaHome /> },
        { name: 'Menu', path: '/admin/menu', icon: <FaUtensils /> },
        { name: 'Orders', path: '/admin/orders', icon: <FaClipboardList /> },
        { name: 'Rejections', path: '/admin/rejections', icon: <FaTimesCircle /> },
        { name: 'Reviews', path: '/admin/reviews', icon: <FaStar /> },
        { name: 'Transactions', path: '/admin/transactions', icon: <FaWallet /> },
        { name: 'Marketing', path: '/admin/marketing', icon: <FaBullhorn /> },
    ];

    return (
        <div className="flex h-screen bg-brand-dark text-zinc-100 font-sans relative overflow-hidden">
            {/* Ambient background glows for the admin panel */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Sidebar */}
            <div className="w-64 bg-zinc-950/60 border-r border-white/5 flex flex-col z-10 relative shadow-sm backdrop-blur-md">
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse"></span>
                        <span>FoodCourt</span>
                    </h1>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mt-0.5">Management Hub</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/20 shadow-md translate-x-1 font-bold'
                                        : 'text-zinc-400 hover:bg-brand-primary/5 hover:text-brand-primary hover:translate-x-1'
                                }`}
                            >
                                <span className={`text-base transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                                <span className="text-xs font-semibold">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-brand-primary/20 text-brand-primary font-extrabold flex items-center justify-center border border-brand-primary/30 flex-shrink-0">
                            {user?.name ? user.name[0].toUpperCase() : 'A'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</h4>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest truncate">Store Owner</span>
                        </div>
                    </div>
                    <button 
                        onClick={logout} 
                        className="p-2 text-zinc-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all flex-shrink-0 cursor-pointer" 
                        title="Logout"
                    >
                        <FaSignOutAlt className="text-sm" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8 sm:p-10 relative z-10 bg-[#0c0c0e]">
                <Outlet />
            </div>
        </div>
    );
};

export default OwnerLayout;
