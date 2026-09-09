import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaPlus, FaMinus, FaSearch, FaPhoneAlt } from 'react-icons/fa';
import { getImageUrl } from '../utils/getImageUrl';
import TermsModal from '../components/TermsModal';

const UserMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [dietPreference, setDietPreference] = useState('All'); // 'All', 'Veg', 'Non-Veg'
    const [customerPhone, setCustomerPhone] = useState(localStorage.getItem('customerPhone') || '');
    const [showPhoneModal, setShowPhoneModal] = useState(!localStorage.getItem('customerPhone'));
    const [restaurantProfile, setRestaurantProfile] = useState(null);
    const [activeOrderId, setActiveOrderId] = useState(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const { addToCart, removeFromCart, updateQuantity, cart } = useContext(CartContext);
    const categoryRefs = useRef({});

    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (customerPhone.length >= 10) {
            localStorage.setItem('customerPhone', customerPhone);
            setShowPhoneModal(false);
        }
    };

    useEffect(() => {
        const fetchMenuAndProfile = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const ownerId = searchParams.get('restaurant');
                
                // Fetch menu items
                const { data: menuData } = await axios.get('/api/menu', { params: { restaurant: ownerId } });
                const availableItems = menuData.filter(item => item.isAvailable);
                setMenuItems(availableItems);
                
                const cats = [...new Set(availableItems.map(item => item.category))];
                setCategories(cats);
                setActiveCategory('All');

                // Fetch public profile (restaurant name & logo)
                if (ownerId) {
                    try {
                        const { data: profileData } = await axios.get(`/api/auth/restaurant/${ownerId}`);
                        setRestaurantProfile(profileData);
                    } catch (err) {
                        console.error('Failed to load restaurant profile', err);
                    }
                }

                // Check active order status
                const savedOrderId = localStorage.getItem('activeOrderId');
                if (savedOrderId) {
                    try {
                        const { data: activeOrder } = await axios.get(`/api/orders/${savedOrderId}`);
                        if (['Completed', 'Cancelled'].includes(activeOrder.orderStatus)) {
                            localStorage.removeItem('activeOrderId');
                            setActiveOrderId(null);
                        } else {
                            setActiveOrderId(savedOrderId);
                        }
                    } catch (err) {
                        localStorage.removeItem('activeOrderId');
                        setActiveOrderId(null);
                    }
                }
            } catch (error) {
                console.error('Failed to load menu data', error);
            }
        };
        fetchMenuAndProfile();
    }, []);

    const filteredItems = menuItems.filter(item => {
        if (dietPreference === 'Veg' && item.isVeg === false) return false;
        if (dietPreference === 'Non-Veg' && item.isVeg !== false) return false;
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const groupedItems = categories.reduce((acc, cat) => {
        const itemsInCat = filteredItems.filter(item => item.category === cat);
        if (itemsInCat.length > 0) acc[cat] = itemsInCat;
        return acc;
    }, {});

    const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const getItemQuantity = (id) => {
        const item = cart.find(i => i.menuItem === id);
        return item ? item.quantity : 0;
    };

    return (
        <div className="min-h-screen bg-brand-dark font-sans pb-32 text-zinc-100 relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute top-1/3 left-[-10%] w-[350px] h-[350px] bg-brand-amber/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Premium Header */}
            <div className="bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-6 py-3">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            {restaurantProfile?.logo ? (
                                <img 
                                    src={getImageUrl(restaurantProfile.logo)} 
                                    alt={restaurantProfile.name} 
                                    className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-md shadow-brand-primary/10 animate-float"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-brand-primary/20 animate-float">
                                    {restaurantProfile?.name ? restaurantProfile.name[0].toUpperCase() : 'F'}
                                </div>
                            )}
                            <h1 className="text-xl font-extrabold text-white tracking-tight">
                                {restaurantProfile?.name || 'FoodCourt'}
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center bg-zinc-900/60 px-4 py-2.5 rounded-full border border-white/5 transition-all focus-within:ring-2 focus-within:ring-brand-primary focus-within:bg-zinc-900">
                                <FaSearch className="text-zinc-500 mr-2" />
                                <input 
                                    type="text" 
                                    placeholder="Search delicious food..." 
                                    className="bg-transparent border-none outline-none text-sm w-48 focus:w-64 transition-all duration-300 text-white placeholder-zinc-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Link to="/cart" className="relative bg-zinc-900 border border-white/5 p-3 rounded-full text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-inner">
                                <FaShoppingCart className="text-xl" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-brand-primary text-white text-[10px] font-extrabold w-5.5 h-5.5 flex items-center justify-center rounded-full shadow-lg ring-2 ring-zinc-950 transform scale-110">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                    
                    {/* Mobile Search */}
                    <div className="sm:hidden mb-4 flex items-center bg-zinc-900/60 px-4 py-3 rounded-xl border border-white/5 focus-within:ring-2 focus-within:ring-brand-primary focus-within:bg-zinc-900 transition-all">
                        <FaSearch className="text-zinc-500 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search food..." 
                            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-zinc-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        {/* Categories Horizontal Scroll */}
                        <div className="overflow-x-auto whitespace-nowrap hide-scrollbar flex space-x-6 pb-3 pt-1 flex-1 scroll-smooth">
                            <button 
                                onClick={() => setActiveCategory('All')}
                                className="flex flex-col items-center space-y-2 cursor-pointer focus:outline-none group"
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                                    activeCategory === 'All' 
                                    ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20 scale-105 shadow-lg shadow-brand-primary/30' 
                                    : 'bg-zinc-900/60 border border-white/5 text-zinc-400 group-hover:bg-zinc-800/80 group-hover:text-white'
                                }`}>
                                    🍔
                                </div>
                                <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                                    activeCategory === 'All' ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-zinc-300'
                                }`}>
                                    All
                                </span>
                            </button>
                            {categories.map(cat => {
                                const getCategoryIcon = (category) => {
                                    const c = category.toLowerCase();
                                    if (c.includes('pizza')) return '🍕';
                                    if (c.includes('burger')) return '🍔';
                                    if (c.includes('drink') || c.includes('beverage') || c.includes('coke') || c.includes('juice')) return '🍹';
                                    if (c.includes('dessert') || c.includes('sweet') || c.includes('cake') || c.includes('ice')) return '🍰';
                                    if (c.includes('starter') || c.includes('appetizer')) return '🍟';
                                    if (c.includes('veg')) return '🥗';
                                    if (c.includes('non-veg') || c.includes('chicken') || c.includes('meat')) return '🍗';
                                    if (c.includes('pasta') || c.includes('noodle')) return '🍝';
                                    return '🍽️';
                                };
                                return (
                                    <button 
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className="flex flex-col items-center space-y-2 cursor-pointer focus:outline-none group"
                                    >
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                                            activeCategory === cat 
                                            ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20 scale-105 shadow-lg shadow-brand-primary/30' 
                                            : 'bg-zinc-900/60 border border-white/5 text-zinc-400 group-hover:bg-zinc-800/80 group-hover:text-white'
                                        }`}>
                                            {getCategoryIcon(cat)}
                                        </div>
                                        <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                                            activeCategory === cat ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-zinc-300'
                                        }`}>
                                            {cat}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Diet Filter Selection */}
                        <div className="ml-4 pl-4 border-l border-white/5 flex-shrink-0 flex items-center bg-zinc-900/40 p-1 rounded-xl space-x-1 border border-white/5">
                            {['All', 'Veg', 'Non-Veg'].map(pref => (
                                <button
                                    key={pref}
                                    onClick={() => setDietPreference(pref)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                        dietPreference === pref
                                        ? (pref === 'Veg' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : pref === 'Non-Veg' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-white')
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {pref}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-6 py-8 relative z-10">
                {Object.keys(groupedItems).length === 0 ? (
                    <div className="text-center mt-12 p-10 glass-premium rounded-2xl border border-white/5 max-w-md mx-auto animate-fade-in-up">
                        <div className="text-6xl mb-4 opacity-70 animate-float">🍽️</div>
                        <h2 className="text-xl font-extrabold text-white mb-2">No items found</h2>
                        <p className="text-zinc-400 text-sm font-medium">Try adjusting your search or filters.</p>
                        {(searchQuery || dietPreference !== 'All') && (
                            <button onClick={() => { setSearchQuery(''); setDietPreference('All'); }} className="mt-6 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:brightness-110 transition-all hover:scale-105 active:scale-95">
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {(activeCategory === 'All' ? Object.keys(groupedItems) : (groupedItems[activeCategory] ? [activeCategory] : [])).map(cat => (
                            <div key={cat} ref={el => categoryRefs.current[cat] = el} className="scroll-mt-48">
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-lg font-extrabold text-white capitalize tracking-tight">{cat}</h2>
                                    <div className="h-px bg-white/5 flex-1 mt-2"></div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {groupedItems[cat].map(item => {
                                        const qty = getItemQuantity(item._id);
                                        const mockRating = (4.2 + ((item._id.charCodeAt(item._id.length - 1) || 0) % 8) * 0.1).toFixed(1);
                                        return (
                                            <div key={item._id} className={`glass-premium rounded-2xl p-3.5 border transition-all duration-300 flex flex-col justify-between group ${
                                                qty > 0 ? 'border-brand-primary/60 shadow-lg shadow-brand-primary/5' : 'border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-brand-primary/5 hover:-translate-y-1'
                                            }`}>
                                                {/* Image side */}
                                                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-white/5 mb-3">
                                                    <img src={getImageUrl(item.image)} alt={item.name} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                                                    <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10 flex items-center justify-center">
                                                        <div className={`w-2 h-2 rounded-full ${item.isVeg === false ? 'bg-red-500' : 'bg-green-500'}`} title={item.isVeg === false ? 'Non-Veg' : 'Veg'}></div>
                                                    </div>
                                                    <div className="absolute bottom-2 right-2 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[9px] font-extrabold text-zinc-300">
                                                        ★ {mockRating}
                                                    </div>
                                                </div>
                                                
                                                {/* Content side */}
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div className="mb-2">
                                                        <span className="text-[9px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded tracking-wider uppercase">{item.category}</span>
                                                        <h3 className="text-sm font-extrabold text-white leading-tight mt-1 line-clamp-2 group-hover:text-brand-primary transition-colors">{item.name}</h3>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between mt-auto pt-2">
                                                        <div className="text-base font-extrabold text-white tracking-tight">₹{item.price}</div>
                                                        
                                                        {qty === 0 ? (
                                                            <button 
                                                                onClick={() => addToCart(item)}
                                                                className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md shadow-brand-primary/20 hover:bg-brand-secondary hover:scale-105 transition-all outline-none cursor-pointer"
                                                            >
                                                                <FaPlus className="text-xs" />
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center bg-zinc-900/90 rounded-lg p-0.5 border border-white/10 shadow-inner">
                                                                <button onClick={() => updateQuantity(item._id, qty - 1)} className="w-6 h-6 flex items-center justify-center text-brand-primary hover:bg-white/5 rounded-md transition-all"><FaMinus className="text-[8px]" /></button>
                                                                <span className="w-5 text-center font-extrabold text-white text-xs">{qty}</span>
                                                                <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center text-brand-primary hover:bg-white/5 rounded-md transition-all"><FaPlus className="text-[8px]" /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Floating Checkout Banner */}
            {cartItemsCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
                    <div className="max-w-4xl mx-auto glass-premium text-white rounded-2xl p-4 shadow-2xl flex justify-between items-center sm:px-6 border border-white/10 animate-fade-in-up">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{cartItemsCount} item{cartItemsCount > 1 ? 's' : ''} added</span>
                            <span className="text-xl font-extrabold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">₹{cart.reduce((a,c)=>a+(c.price*c.quantity),0)}</span>
                        </div>
                        <Link to="/cart" className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:brightness-110 transition-all hover:scale-105 active:scale-95">
                            VIEW CART <FaShoppingCart className="text-sm" />
                        </Link>
                    </div>
                </div>
            )}

            {showPhoneModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="glass-premium p-6 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-white/10 relative z-[101] animate-fade-in-up">
                        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FaPhoneAlt className="text-2xl text-brand-primary" />
                        </div>
                        <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">Welcome!</h3>
                        <p className="text-zinc-400 text-sm font-medium mb-6">Please enter your contact number to view the menu and track order status.</p>
                        <form onSubmit={handlePhoneSubmit}>
                            <input 
                                type="tel" 
                                required 
                                placeholder="Enter 10-digit number" 
                                pattern="[0-9]{10,15}"
                                className="w-full px-5 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all mb-4 text-center text-lg font-bold tracking-widest text-white placeholder-zinc-600"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                            />
                            <button type="submit" className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3.5 rounded-xl hover:brightness-110 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all flex justify-center text-sm uppercase tracking-wider cursor-pointer">
                                Continue to Menu
                            </button>
                            <p className="text-[10px] text-zinc-500 mt-4 leading-normal">
                                By continuing, you agree to our <button type="button" onClick={() => setShowTermsModal(true)} className="text-brand-primary hover:text-brand-secondary underline font-bold focus:outline-none cursor-pointer">Terms & Conditions</button> and cancellation policy.
                            </p>
                        </form>
                    </div>
                </div>
            )}

            {/* Active Order Tracker Button */}
            {activeOrderId && (
                <div className={`fixed ${cartItemsCount > 0 ? 'bottom-24' : 'bottom-6'} left-6 z-[60]`}>
                    <Link 
                        to={`/order/${activeOrderId}`}
                        className="flex items-center space-x-2 bg-brand-primary text-white font-extrabold text-[10px] uppercase tracking-widest px-5 py-3.5 rounded-full shadow-lg shadow-brand-primary/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all border border-brand-primary/10 text-white-force"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <span>Track Active Order</span>
                    </Link>
                </div>
            )}

            {/* Footer Admin Link */}
            <div className="pt-12 pb-6 text-center">
                <Link to="/login" className="text-zinc-600 text-xs font-semibold hover:text-zinc-400 transition-colors">
                    Restaurant Owner? Login Here
                </Link>
            </div>

            <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
        </div>
    );
};

export default UserMenu;
