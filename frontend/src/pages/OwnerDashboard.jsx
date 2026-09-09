import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaMoneyBillWave, FaListOl, FaSpinner, FaUtensils, FaEdit, FaStar, FaRegStar, FaQuoteLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../utils/getImageUrl';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OwnerDashboard = () => {
    const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, activeOrders: 0 });
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const { user, setUser } = useContext(AuthContext);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            return toast.error('Logo image size must be less than 2MB');
        }

        const convertToBase64 = (fileObj) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(fileObj);
                reader.onload = () => resolve(reader.result);
                reader.onerror = (err) => reject(err);
            });
        };

        try {
            const base64Logo = await convertToBase64(file);
            const token = localStorage.getItem('ownerToken');
            const { data } = await axios.put('/api/auth/profile', {
                name: user?.name,
                logo: base64Logo
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setUser(data);
            toast.success('Logo updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update logo');
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('ownerToken');
                const { data } = await axios.get('/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(data);
                
                const revenue = data.reduce((acc, order) => acc + (order.paymentStatus === 'Paid' ? order.totalAmount : 0), 0);
                const active = data.filter(order => !['Completed', 'Cancelled'].includes(order.orderStatus)).length;
                
                setStats({
                    revenue,
                    totalOrders: data.length,
                    activeOrders: active
                });

                // Fetch reviews
                try {
                    const { data: reviewsData } = await axios.get('/api/reviews/owner', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setReviews(reviewsData);
                } catch (err) {
                    console.error('Error loading reviews:', err);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };
        fetchDashboardData();
    }, []);

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Revenue (₹)',
                data: [0, 0, 0, 0, 0, 0, stats.revenue],
                backgroundColor: 'rgba(16, 185, 129, 0.85)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 0,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { 
                position: 'top',
                labels: { color: '#1e293b' }
            },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    color: '#475569',
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#475569',
                }
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-5 glass-premium p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden w-full">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center space-x-5 z-10 w-full">
                    {/* Logo container with overlay upload */}
                    <div className="relative group cursor-pointer w-20 h-20 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
                        {user?.logo ? (
                            <img src={getImageUrl(user.logo)} alt="Restaurant Logo" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                            <FaUtensils className="text-3xl text-brand-primary animate-pulse" />
                        )}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold text-white">
                            <FaEdit className="text-base mb-1 text-brand-primary" />
                            <span>Change Logo</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div>
                        <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Analytics Overview</span>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">Welcome back, {user?.name || 'Owner'}</h1>
                        <p className="text-zinc-400 text-xs font-medium mt-1">Manage your storefront, QR codes, campaigns, and monitor sales metrics.</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-premium p-6 rounded-2xl border border-white/5 flex items-center space-x-5 hover:border-white/10 hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-300">
                    <div className="p-4 bg-brand-primary/10 rounded-xl text-brand-primary">
                        <FaMoneyBillWave className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-2xl font-extrabold text-white">₹{stats.revenue}</p>
                    </div>
                </div>

                <div className="glass-premium p-6 rounded-2xl border border-white/5 flex items-center space-x-5 hover:border-white/10 hover:shadow-lg hover:shadow-brand-amber/5 transition-all duration-300">
                    <div className="p-4 bg-brand-amber/10 rounded-xl text-brand-amber">
                        <FaListOl className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Orders</p>
                        <p className="text-2xl font-extrabold text-white">{stats.totalOrders}</p>
                    </div>
                </div>

                <div className="glass-premium p-6 rounded-2xl border border-white/5 flex items-center space-x-5 hover:border-white/10 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300">
                    <div className="p-4 bg-sky-500/10 rounded-xl text-sky-400">
                        <FaSpinner className="text-2xl animate-spin-slow" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Orders</p>
                        <p className="text-2xl font-extrabold text-white">{stats.activeOrders}</p>
                    </div>
                </div>

                <div className="glass-premium p-6 rounded-2xl border border-white/5 flex items-center space-x-5 hover:border-white/10 hover:shadow-lg hover:shadow-brand-amber/5 transition-all duration-300">
                    <div className="p-4 bg-brand-amber/10 rounded-xl text-brand-amber">
                        <FaStar className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Average Rating</p>
                        <p className="text-2xl font-extrabold text-white flex items-baseline gap-1">
                            {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                            <span className="text-[10px] text-zinc-500 font-semibold">({reviews.length})</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-premium p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Revenue Overview</h3>
                    <Bar options={chartOptions} data={chartData} />
                </div>
                
                <div className="glass-premium p-6 rounded-2xl border border-white/5 h-[450px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white tracking-tight">Recent Active Orders</h3>
                    </div>
                    
                    {stats.activeOrders === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                            No active orders currently.
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                            {orders.filter(o => !['Completed', 'Cancelled'].includes(o.orderStatus)).slice(0, 6).map(order => (
                                <div key={order._id} className="p-4 bg-zinc-900/40 rounded-xl border border-white/5 flex justify-between items-center hover:bg-zinc-800/40 hover:border-white/10 transition-all duration-200">
                                    <div>
                                        <p className="font-extrabold text-white text-base">Token: <span className="text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-lg text-sm ml-1">{order.tokenNumber}</span></p>
                                        <p className="text-xs text-zinc-400 mt-1.5">{order.items.length} items | {order.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white mb-2">₹{order.totalAmount}</p>
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                                            order.orderStatus === 'Preparing' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                            order.orderStatus === 'Ready' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                        }`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Overview Section */}
            {reviews.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Distribution breakdown */}
                    <div className="glass-premium p-6 rounded-2xl border border-white/5 flex flex-col shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Review Ratings</h3>
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            {[5, 4, 3, 2, 1].map(stars => {
                                const count = reviews.filter(r => r.rating === stars).length;
                                const percentage = Math.round((count / reviews.length) * 100);
                                return (
                                    <div key={stars} className="flex items-center text-xs text-zinc-400">
                                        <span className="w-12 font-semibold flex items-center gap-1">{stars} ★</span>
                                        <div className="flex-1 h-2 bg-zinc-950 rounded-full mx-3 overflow-hidden border border-white/5">
                                            <div className="h-full bg-brand-amber rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <span className="w-8 text-right font-bold text-zinc-300">{percentage}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent reviews list */}
                    <div className="glass-premium p-6 rounded-2xl border border-white/5 lg:col-span-2 flex flex-col shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Recent Customer Reviews</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {reviews.slice(0, 3).map((review) => (
                                <div key={review._id} className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-center mb-2.5">
                                        <span className="text-xs font-bold text-zinc-300">{review.customerPhone}</span>
                                        <div className="flex space-x-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <FaStar key={s} className={`text-[10px] ${s <= review.rating ? 'text-brand-amber' : 'text-zinc-800'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 italic">"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;
