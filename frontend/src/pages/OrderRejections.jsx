import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPhoneAlt, FaExclamationCircle } from 'react-icons/fa';

const OrderRejections = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRejections = async () => {
        try {
            const token = localStorage.getItem('ownerToken');
            const { data } = await axios.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter only cancelled/rejected orders
            setOrders(data.filter(order => order.orderStatus === 'Cancelled'));
        } catch (error) {
            toast.error('Failed to load rejected orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRejections();
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center text-lg font-bold text-zinc-500 tracking-wider animate-pulse">Loading rejections...</div>;

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            <div className="flex justify-between items-center glass-premium p-6 rounded-2xl border border-white/5">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Cancellation Logs</span>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">Order Rejections</h2>
                </div>
                <span className="text-xs font-bold text-zinc-400 bg-zinc-900 px-4 py-2 border border-white/5 rounded-full">
                    {orders.length} rejected orders
                </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {orders.length > 0 ? orders.map((order) => (
                    <div key={order._id} className="glass-premium rounded-2xl p-6 border border-white/5 hover:border-white/10 hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                            <div>
                                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                    Token: <span className="text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-0.5 rounded-lg text-sm">{order.tokenNumber}</span>
                                </h3>
                                <div className="text-xs text-zinc-500 font-semibold mt-3.5 flex flex-wrap items-center gap-2">
                                    <span className="bg-zinc-800 border border-white/5 px-2.5 py-0.5 rounded-lg text-zinc-300">{order.type}</span>
                                    <span>•</span>
                                    <span>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span>•</span>
                                    <span className="font-bold text-zinc-300 flex items-center gap-1.5"><FaPhoneAlt className="text-[10px]" /> {order.customerPhone}</span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-red-500/10 text-red-400 border-red-500/20">
                                    Cancelled
                                </span>
                                <p className="mt-3 text-xl font-extrabold text-white">₹{order.totalAmount}</p>
                            </div>
                        </div>

                        {/* Cancellation Reason */}
                        <div className="mb-4 bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex items-start gap-2.5">
                            <FaExclamationCircle className="text-red-400 text-sm mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Reason for Rejection</h4>
                                <p className="text-xs text-zinc-300 font-semibold">{order.cancellationReason || 'No reason provided'}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2 bg-zinc-950/40 p-4 rounded-xl max-h-48 overflow-y-auto border border-white/5">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Ordered Items</h4>
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-zinc-300">
                                    <div className="font-medium text-xs flex items-center">
                                        <span className="text-brand-primary bg-brand-primary/10 w-5 h-5 flex items-center justify-center rounded mr-2 text-[10px] font-bold">{item.quantity}x</span> 
                                        {item.name}
                                    </div>
                                    <div className="text-white font-bold text-xs">₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-2 glass-premium py-16 text-center rounded-2xl border border-white/5 text-zinc-500 text-sm font-medium">
                        No rejected orders found in the history log.
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderRejections;
