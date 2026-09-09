import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaStar, FaRegStar, FaUser, FaCalendarAlt, FaQuoteLeft } from 'react-icons/fa';

const ReviewsManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('ownerToken');
            const { data } = await axios.get('/api/reviews/owner', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(data);
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const calculateAverage = () => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        return (total / reviews.length).toFixed(1);
    };

    const renderStars = (rating) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}>
                        {star <= rating ? (
                            <FaStar className="text-brand-amber text-sm" />
                        ) : (
                            <FaRegStar className="text-zinc-700 text-sm" />
                        )}
                    </span>
                ))}
            </div>
        );
    };

    if (loading) return <div className="flex h-64 items-center justify-center text-lg font-bold text-zinc-500 tracking-wider animate-pulse">Loading reviews...</div>;

    const averageRating = calculateAverage();

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-5 glass-premium p-6 sm:p-8 rounded-2xl shadow-xl text-white relative overflow-hidden border border-white/5">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Customer Feedback</span>
                    <h2 className="text-2xl font-extrabold tracking-tight mt-1 mb-2">Reviews</h2>
                    <p className="text-zinc-400 text-sm font-medium">Monitor ratings and read dining reviews submitted by your customers.</p>
                </div>
            </div>

            {/* Overall Rating Header */}
            {reviews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                    <div className="glass-premium p-6 rounded-2xl border border-white/5 flex items-center space-x-4 shadow-xl">
                        <div className="w-14 h-14 rounded-xl bg-brand-amber/10 text-brand-amber flex items-center justify-center text-2xl border border-brand-amber/10">
                            <FaStar />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-0.5">Average Rating</p>
                            <h4 className="text-2xl font-extrabold text-white flex items-baseline gap-1">
                                {averageRating} <span className="text-xs text-zinc-500 font-semibold">/ 5.0</span>
                            </h4>
                        </div>
                    </div>
                    <div className="glass-premium p-6 rounded-2xl border border-white/5 flex items-center space-x-4 shadow-xl">
                        <div className="w-14 h-14 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xl border border-brand-primary/10">
                            <FaQuoteLeft />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-0.5">Total Reviews</p>
                            <h4 className="text-2xl font-extrabold text-white">{reviews.length}</h4>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6 max-w-4xl">
                {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review._id} className="glass-premium rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
                                    <FaUser className="text-sm" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">{review.customerPhone}</h4>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-semibold">
                                        <FaCalendarAlt className="text-[9px]" />
                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>Order ID: {review.order}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {renderStars(review.rating)}
                                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-amber mt-1 inline-block bg-brand-amber/5 px-2 py-0.5 rounded border border-brand-amber/10">
                                    {review.rating} Stars
                                </span>
                            </div>
                        </div>
                        <div className="text-sm text-zinc-300 font-medium leading-relaxed italic px-2">
                            "{review.comment}"
                        </div>
                    </div>
                )) : (
                    <div className="glass-premium py-16 text-center rounded-2xl border border-white/5 text-zinc-500 text-sm font-medium">
                        No reviews found. Customer reviews will appear here once submitted.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsManagement;
