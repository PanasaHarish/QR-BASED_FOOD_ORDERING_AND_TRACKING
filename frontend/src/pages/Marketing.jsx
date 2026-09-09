import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaBullhorn, FaUsers, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Marketing = () => {
    const [message, setMessage] = useState('');
    const [audienceSize, setAudienceSize] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [results, setResults] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchAudience = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/marketing/audience', config);
                setAudienceSize(data.count);
            } catch (error) {
                console.error('Failed to fetch audience size');
            }
        };
        fetchAudience();
    }, [token]);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!message) return toast.error('Please enter a message.');
        if (audienceSize === 0) return toast.error('You have no customers to send messages to.');
        
        const confirmSend = window.confirm(`Are you sure you want to send this SMS to ${audienceSize} customers?`);
        if (!confirmSend) return;

        setIsSending(true);
        setResults(null);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('/api/marketing/broadcast', { message }, config);
            
            setResults(data);
            toast.success(`Successfully sent ${data.successCount} messages!`);
            setMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send broadcast');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto font-sans animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Promotional Campaigns</span>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
                        <FaBullhorn className="text-brand-primary text-xl" /> SMS Marketing
                    </h2>
                    <p className="text-zinc-400 text-sm font-medium mt-1">Send announcements and promotions directly to your customers' phones.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <form onSubmit={handleBroadcast} className="glass-premium rounded-2xl p-6 border border-white/5 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full pointer-events-none"></div>

                        <label className="block text-white font-extrabold mb-3 text-lg">Broadcast Message</label>
                        <textarea 
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 text-white outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary transition-all resize-none h-40 text-sm"
                            placeholder="e.g. Try our new weekend special! Get 20% off all orders today using code SPECIAL20."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={160}
                        ></textarea>
                        
                        <div className="flex justify-between items-center mt-3 mb-6 text-xs font-bold text-zinc-500 px-2">
                            <span>{message.length} / 160 characters</span>
                            <span className={message.length > 150 ? 'text-brand-primary animate-pulse' : 'text-green-500'}>1 SMS Segment</span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSending || audienceSize === 0}
                            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-white transition-all text-xs uppercase tracking-wider ${
                                isSending || audienceSize === 0 
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5' 
                                : 'bg-gradient-to-r from-brand-primary to-brand-secondary hover:brightness-110 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/45 hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                        >
                            {isSending ? (
                                <span className="animate-pulse">Sending Broadcast...</span>
                            ) : (
                                <>Send to {audienceSize} Customers <FaPaperPlane className="text-xs" /></>
                            )}
                        </button>
                    </form>

                    {results && (
                        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-5 shadow-sm animate-fade-in-up">
                            <h3 className="text-green-400 font-bold text-base mb-2 flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" /> Broadcast Summary
                            </h3>
                            <ul className="space-y-1.5 text-zinc-300 text-sm font-medium">
                                <li><strong>Total Delivered:</strong> {results.successCount}</li>
                                {results.failCount > 0 && <li className="text-red-400"><strong>Failed to Deliver:</strong> {results.failCount}</li>}
                                <li><strong>Total Reached:</strong> {results.total}</li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl p-6 text-white shadow-xl shadow-brand-primary/25 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-5 text-xl backdrop-blur-md border border-white/10">
                            <FaUsers />
                        </div>
                        <h3 className="text-xs font-bold text-white/70 mb-1 uppercase tracking-wider">Total Audience</h3>
                        <p className="text-4xl font-extrabold">{audienceSize}</p>
                        <p className="text-xs font-medium text-white/70 mt-4 leading-relaxed">
                            These are unique customers who have ordered from your QR menu previously.
                        </p>
                    </div>

                    <div className="glass-premium rounded-2xl p-6 border border-white/5">
                        <h4 className="font-bold text-white mb-4 block text-sm tracking-tight border-b border-white/5 pb-2">Pro Tips</h4>
                        <ul className="space-y-3.5 text-xs text-zinc-400">
                            <li className="flex gap-2">
                                <span className="text-brand-primary font-bold">•</span> 
                                Keep messages under 160 characters to send exactly one SMS segment.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary font-bold">•</span> 
                                Include special discount codes to track ROI on your broadcasts.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary font-bold">•</span> 
                                Don't spam! Send max 1-2 messages per week before meal times.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketing;
