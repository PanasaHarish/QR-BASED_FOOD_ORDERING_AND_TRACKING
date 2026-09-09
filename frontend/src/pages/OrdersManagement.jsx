import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaCheck, FaExclamationCircle, FaPhoneAlt } from 'react-icons/fa';

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('ownerToken');
            const { data } = await axios.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(data);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id, status, extraData = {}) => {
        try {
            const token = localStorage.getItem('ownerToken');
            const body = { orderStatus: status, ...extraData };
            
            await axios.put(`/api/orders/${id}`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Order updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update order');
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center text-lg font-bold text-zinc-500 tracking-wider animate-pulse">Loading orders...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Confirmed': return 'bg-blue-500/10 text-sky-400 border-sky-500/20';
            case 'Preparing': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'Ready': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Completed': return 'bg-zinc-800 text-zinc-400 border-white/5';
            case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-zinc-800 text-zinc-400 border-white/5';
        }
    };

    const activeOrders = orders.filter(order => !['Completed', 'Cancelled'].includes(order.orderStatus));

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center glass-premium p-6 rounded-2xl border border-white/5">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Order Queue</span>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">Live Orders</h2>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-zinc-400 bg-zinc-900 px-4 py-2 border border-white/5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>Auto-updating</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {activeOrders.length > 0 ? (
                    activeOrders.map((order) => (
                        <div key={order._id} className={`glass-premium rounded-2xl p-6 border ${order.orderStatus === 'Pending' ? 'border-brand-primary/40 ring-2 ring-brand-primary/5' : 'border-white/5'} hover:border-white/10 hover:shadow-lg transition-all duration-300`}>
                            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                        Token: <span className="text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-0.5 rounded-lg text-sm">{order.tokenNumber}</span>
                                    </h3>
                                    <div className="text-xs text-zinc-500 font-semibold mt-3.5 flex flex-wrap items-center gap-2">
                                        <span className="bg-zinc-800 border border-white/5 px-2.5 py-0.5 rounded-lg text-zinc-300">{order.type}</span>
                                        <span>•</span>
                                        <span>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <span>•</span>
                                        <span className="font-bold text-zinc-300 flex items-center gap-1.5"><FaPhoneAlt className="text-[10px]" /> {order.customerPhone}</span>
                                    </div>
                                    <div className="mt-2.5 flex flex-wrap gap-2">
                                        {order.paymentMethod === 'Cash' && order.paymentStatus === 'Pending' && (
                                            <span className="inline-flex items-center text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-red-500/20">
                                                <FaExclamationCircle className="mr-1" /> Cash Pending
                                            </span>
                                        )}
                                        {order.paymentStatus === 'Paid' && (
                                            <span className="inline-flex items-center text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-green-500/20">
                                                <FaCheck className="mr-1" /> Paid via {order.paymentMethod}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                    <p className="mt-3 text-xl font-extrabold text-white">₹{order.totalAmount}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4 bg-zinc-950/40 p-4 rounded-xl max-h-48 overflow-y-auto border border-white/5">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Order Items</h4>
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

                            <div className="flex flex-wrap gap-2 justify-end items-center pt-1 border-t border-white/5 pt-4">
                                {order.orderStatus === 'Pending' && (
                                    <button onClick={() => updateStatus(order._id, 'Confirmed')} className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow transition-all duration-300 cursor-pointer">
                                        <FaCheck className="text-xs" /> <span>Confirm Order</span>
                                    </button>
                                )}
                                {order.orderStatus === 'Confirmed' && (
                                    <button onClick={() => {
                                        const time = window.prompt("Estimated prep time in minutes?", "15");
                                        if(time) updateStatus(order._id, 'Preparing', { estimatedTime: parseInt(time) });
                                    }} className="w-full sm:w-auto flex items-center justify-center bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow transition-all duration-300 cursor-pointer">
                                        Start Preparing
                                    </button>
                                )}
                                {order.orderStatus === 'Preparing' && (
                                    <button onClick={() => {
                                        const customMessage = window.prompt("Enter WhatsApp message to send to customer:", `Hello! Your order (Token: ${order.tokenNumber}) is now READY for pickup.`);
                                        if(customMessage !== null) {
                                            updateStatus(order._id, 'Ready');
                                            const phone = String(order.customerPhone).replace(/\D/g, '').slice(-10);
                                            if (phone.length === 10) {
                                                const newWindow = window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(customMessage)}`, '_blank');
                                                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                                                    toast.error('Pop-up blocked! Please allow pop-ups for this site to open WhatsApp.', { duration: 5000 });
                                                }
                                            } else {
                                                toast.error('Invalid customer phone number.');
                                            }
                                        }
                                    }} className="w-full sm:w-auto flex items-center justify-center bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow transition-all duration-300 cursor-pointer">
                                        Mark as Ready
                                    </button>
                                )}
                                {order.orderStatus === 'Ready' && (
                                    <button onClick={() => updateStatus(order._id, 'Completed')} className="w-full sm:w-auto flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow transition-all duration-300 cursor-pointer">
                                        Complete & Archive
                                    </button>
                                )}
                                {order.paymentStatus === 'Pending' && order.orderStatus !== 'Cancelled' && (
                                    <button onClick={() => {
                                        const reason = window.prompt("Please provide a reason for cancellation:", "Item unavailable");
                                        if(reason !== null) updateStatus(order._id, 'Cancelled', { cancellationReason: reason });
                                    }} className="w-full sm:w-auto flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-500/20 transition-all duration-300 cursor-pointer">
                                        Cancel Order
                                    </button>
                                )}
                                {(order.paymentStatus === 'Pending' && order.paymentMethod === 'Cash') && (
                                    <button onClick={async () => {
                                        const token = localStorage.getItem('ownerToken');
                                        await axios.put(`/api/orders/${order._id}`, { paymentStatus: 'Paid' }, { headers: { Authorization: `Bearer ${token}` } });
                                        toast.success('Payment Received');
                                        fetchOrders();
                                    }} className="w-full sm:w-auto flex items-center justify-center bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-green-500/20 transition-all duration-300 ml-auto cursor-pointer">
                                        Mark Cash Paid
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 glass-premium py-16 text-center rounded-2xl border border-white/5 text-zinc-500 text-sm font-medium">
                        No active orders in the queue.
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersManagement;
