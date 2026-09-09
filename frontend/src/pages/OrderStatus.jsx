import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaClock, FaUtensils, FaArrowLeft, FaReceipt, FaStar, FaRegStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const OrderStatus = () => {
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!order);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittedReview, setSubmittedReview] = useState(localStorage.getItem(`review_${id}`) === 'true');

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/reviews', {
                rating: reviewRating,
                comment: reviewComment,
                customerPhone: order.customerPhone,
                restaurant: order.restaurant,
                order: order._id
            });
            localStorage.setItem(`review_${order._id}`, 'true');
            setSubmittedReview(true);
            setReviewComment('');
            setReviewRating(5);
            toast.success('Thank you for your feedback!');
        } catch (error) {
            toast.error('Failed to submit review');
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`/api/orders/${id}`);
                if(isMounted) setOrder(data);
                if (['Completed', 'Cancelled'].includes(data.orderStatus)) {
                    localStorage.removeItem('activeOrderId');
                }
            } catch (error) {
                console.error("Could not fetch order");
            } finally {
                if(isMounted) setLoading(false);
            }
        };

        if (!order) fetchOrder();
        
        const interval = setInterval(() => {
            fetchOrder();
        }, 10000);
        
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [id, order]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <div className="animate-pulse text-lg font-bold text-zinc-500 tracking-wider">Loading Order Status...</div>
            </div>
        );
    }
    
    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <div className="text-zinc-500 text-lg font-medium">Order not found.</div>
            </div>
        );
    }

    const getStatusStep = (status) => {
        const steps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];
        return steps.indexOf(status);
    };

    const currentStepIndex = getStatusStep(order.orderStatus);

    return (
        <div className="min-h-screen bg-brand-dark text-zinc-100 font-sans overflow-y-auto relative pb-10">
            {/* Ambient glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full bg-brand-secondary/5 blur-[120px] pointer-events-none"></div>
            
            <div className="max-w-md mx-auto min-h-screen flex flex-col pt-8 relative z-10 px-4">
                <div className="flex items-center justify-between mb-8">
                    <Link to="/menu" className="w-11 h-11 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center hover:bg-zinc-800 hover:scale-105 transition-all text-zinc-400 hover:text-white">
                        <FaArrowLeft className="text-sm" />
                    </Link>
                    <h1 className="text-sm font-extrabold tracking-widest uppercase text-zinc-400">Order Status</h1>
                    <div className="w-11"></div>
                </div>

                <div className="flex-1 glass-premium text-zinc-100 rounded-2xl px-6 pt-14 pb-8 shadow-2xl border border-white/10 flex flex-col relative mt-10 animate-fade-in-up">
                    {/* Token Badge */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-zinc-950 rounded-full p-1 shadow-xl border border-white/10 z-20">
                        <div className="w-full h-full border-2 border-dashed border-brand-primary/30 rounded-full flex flex-col items-center justify-center bg-zinc-900">
                            <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider mb-0.5">Token</span>
                            <span className="text-xl font-extrabold text-white">{order.tokenNumber}</span>
                        </div>
                    </div>

                    <div className="text-center mt-4 mb-8">
                        {order.restaurant?.name && (
                            <div className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-1.5 animate-pulse">
                                🏬 {order.restaurant.name}
                            </div>
                        )}
                        <h2 className="text-lg font-extrabold mb-2 text-white">
                            {order.orderStatus === 'Cancelled' 
                                ? 'Order Cancelled' 
                                : (order.paymentMethod === 'Cash' && order.paymentStatus === 'Pending' ? 'Pay at Counter' : 'Order Received!')}
                        </h2>
                        <p className="text-zinc-400 font-medium text-sm px-4 leading-relaxed">
                            {order.orderStatus === 'Cancelled'
                                ? "This order will not be processed."
                                : (order.paymentMethod === 'Cash' && order.paymentStatus === 'Pending' 
                                    ? "Please proceed to the counter to pay and collect your receipt." 
                                    : "Your delicious food is being prepared.")}
                        </p>
                    </div>

                    {order.orderStatus === 'Completed' ? (
                        <div className="bg-green-500/5 rounded-xl p-5 mb-6 border border-green-500/10 text-center animate-fade-in-up">
                            <div className="w-12 h-12 bg-zinc-950 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
                                🍽️
                            </div>
                            <h3 className="text-base font-extrabold text-brand-primary mb-1">Food Picked Up!</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed">
                                Thank you for dining with us. Your order has been successfully picked up.
                            </p>
                        </div>
                    ) : order.orderStatus === 'Cancelled' ? (
                        <div className="bg-red-500/5 rounded-xl p-5 mb-6 border border-red-500/10 text-center">
                            <div className="w-12 h-12 bg-zinc-950 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
                                ❌
                            </div>
                            <h3 className="text-base font-extrabold text-red-400 mb-1">Order Cancelled</h3>
                            <p className="text-zinc-500 text-xs mb-4">
                                We're sorry, but your order has been cancelled by the restaurant.
                            </p>
                            {order.cancellationReason && (
                                <div className="bg-zinc-955 p-4 rounded-xl border border-white/5 text-left shadow-sm">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 block mb-1">Reason</span>
                                    <p className="text-zinc-300 font-medium text-xs leading-relaxed">{order.cancellationReason}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-zinc-950/40 rounded-xl p-5 mb-6 border border-white/5 shadow-inner relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                            
                            {/* Status Timeline */}
                            <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-zinc-800">
                                {[
                                    { status: 'Pending', label: 'Order Placed', icon: <FaReceipt />, bg: 'bg-brand-primary shadow-brand-primary/20' },
                                    { status: 'Confirmed', label: 'Confirmed', icon: <FaCheckCircle />, bg: 'bg-brand-primary shadow-brand-primary/20' },
                                    { status: 'Preparing', label: 'Preparing', icon: <FaUtensils />, bg: 'bg-brand-primary shadow-brand-primary/20' },
                                    { status: 'Ready', label: 'Ready for Pickup', icon: <FaClock />, bg: 'bg-green-500 shadow-green-500/20' }
                                ].map((step, index) => {
                                    const isCompleted = currentStepIndex >= index;
                                    const isCurrent = currentStepIndex === index;
                                    
                                    return (
                                        <div key={step.status} className="relative flex items-center z-10">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-500 border ${
                                                isCompleted 
                                                ? `${step.bg} text-white border-transparent scale-110 shadow-lg` 
                                                : 'bg-zinc-900 text-zinc-600 border-white/5'
                                            }`}>
                                                {step.icon}
                                            </div>
                                            <div className={`ml-4 flex-1 transition-all duration-300 ${isCurrent ? 'transform translate-x-1' : ''}`}>
                                                <h4 className={`font-bold text-sm ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>{step.label}</h4>
                                                {isCurrent && order.estimatedTime && step.status === 'Preparing' && (
                                                    <span className="text-[10px] text-brand-primary font-bold mt-1 inline-flex items-center px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
                                                        ⏳ Est. {order.estimatedTime} mins
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto">
                        <div className="bg-zinc-900/50 p-5 rounded-xl border border-white/5 shadow-xl">
                            {/* Order Items List */}
                            <div className="mb-4 pb-4 border-b border-white/5">
                                <h3 className="font-bold text-sm text-white mb-3 flex items-center justify-between">
                                    <span>Order Summary</span>
                                    <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-0.5 rounded-full">{order.items?.length || 0} items</span>
                                </h3>
                                <div className="space-y-3 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="font-bold text-white bg-zinc-800 border border-white/5 w-5 h-5 flex items-center justify-center rounded text-[10px]">{item.quantity}x</span>
                                                <span className="text-zinc-400 truncate mr-2">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-white">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-3.5 pb-3.5 border-b border-white/5">
                                <span className="text-xs font-bold text-zinc-500">Total Amount</span>
                                <span className="text-base font-extrabold text-white">₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-zinc-500">Payment Status</span>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                    order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-brand-amber/10 text-brand-amber border-brand-amber/20'
                                }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                        {order.orderStatus === 'Completed' && (
                            <div className="mt-5 bg-zinc-900/50 p-5 rounded-xl border border-white/5 shadow-xl text-center animate-fade-in-up">
                                {submittedReview ? (
                                    <div className="text-zinc-400 text-xs font-semibold py-2">
                                        🌟 Thank you for your feedback! We look forward to serving you again.
                                    </div>
                                ) : (
                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rate Your Dining Experience</h4>
                                        <div className="flex justify-center space-x-3 my-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="text-xl transition-all duration-200"
                                                >
                                                    {star <= reviewRating ? (
                                                        <FaStar className="text-brand-amber filter drop-shadow-sm" />
                                                    ) : (
                                                        <FaRegStar className="text-zinc-650 hover:text-brand-amber/70" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            required
                                            value={reviewComment}
                                            onChange={e => setReviewComment(e.target.value)}
                                            placeholder="Tell us what you liked or how we can improve..."
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 text-[11px] text-white outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none h-20"
                                        ></textarea>
                                        <button
                                            type="submit"
                                            className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-115 shadow-md transition-all duration-300"
                                        >
                                            Submit Review
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatus;
