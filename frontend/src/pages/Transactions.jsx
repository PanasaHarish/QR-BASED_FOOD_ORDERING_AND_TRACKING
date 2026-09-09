import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaMoneyBillWave, FaCreditCard, FaCalendarAlt } from 'react-icons/fa';

const Transactions = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMethod, setFilterMethod] = useState('All'); // 'All', 'Online', 'Cash'
    
    // Default date range: Last 30 days
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        setStartDate(d.toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('ownerToken');
            const { data } = await axios.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Consider only paid items or completed orders 
            // In our system, paymentStatus tracks if money came in
            setOrders(data.filter(o => o.paymentStatus === 'Paid' && o.orderStatus !== 'Cancelled'));
        } catch (error) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    // Derived filtered transactions based on method and date range
    const filteredTransactions = orders.filter(order => {
        // Date filter
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
        
        // Payment method filter
        if (filterMethod !== 'All' && order.paymentMethod !== filterMethod) return false;
        
        return true;
    });

    const totalRevenue = filteredTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const onlineRevenue = filteredTransactions.filter(o => o.paymentMethod === 'Online').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const cashRevenue = filteredTransactions.filter(o => o.paymentMethod === 'Cash').reduce((acc, curr) => acc + curr.totalAmount, 0);

    if (loading) return <div className="flex h-64 items-center justify-center text-lg font-bold text-zinc-500 tracking-wider animate-pulse">Loading transactions...</div>;

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            {/* Header */}
            <div className="flex justify-between items-center sm:flex-row flex-col gap-5 glass-premium p-6 sm:p-8 rounded-2xl shadow-xl text-white relative overflow-hidden border border-white/5">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                    <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Financial Dashboard</span>
                    <h2 className="text-2xl font-extrabold tracking-tight mt-1 mb-2">Transactions</h2>
                    <p className="text-zinc-400 text-sm font-medium">Detailed payment history and real-time revenue tracking.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-premium p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center space-x-1.5 bg-zinc-950 p-1.5 rounded-xl border border-white/5">
                    {['All', 'Online', 'Cash'].map(method => (
                        <button
                            key={method}
                            onClick={() => setFilterMethod(method)}
                            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                filterMethod === method
                                ? 'bg-zinc-800 text-white shadow-sm border border-white/5'
                                : 'text-zinc-500 hover:text-white hover:bg-zinc-800/20'
                            }`}
                        >
                            {method}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-zinc-500 mb-1 ml-1 flex items-center gap-1 uppercase tracking-wider"><FaCalendarAlt /> Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-xs font-semibold text-white" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-zinc-500 mb-1 ml-1 flex items-center gap-1 uppercase tracking-wider"><FaCalendarAlt /> End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-xs font-semibold text-white" />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-premium p-6 rounded-2xl border border-white/5 flex items-center space-x-4 shadow-xl">
                    <div className="w-14 h-14 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/5 border border-brand-primary/10">
                        <span className="font-extrabold text-2xl">₹</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-0.5">Total Revenue</p>
                        <h4 className="text-2xl font-extrabold text-white">₹{totalRevenue}</h4>
                    </div>
                </div>
                <div className="glass-premium p-6 rounded-2xl border border-white/5 flex items-center space-x-4 border-l-4 border-l-brand-primary shadow-xl">
                    <div className="w-14 h-14 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xl border border-brand-primary/10">
                        <FaCreditCard />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-0.5">Online Payments</p>
                        <h4 className="text-xl font-extrabold text-white">₹{onlineRevenue}</h4>
                    </div>
                </div>
                <div className="glass-premium p-6 rounded-2xl border border-white/5 flex items-center space-x-4 border-l-4 border-l-brand-amber shadow-xl">
                    <div className="w-14 h-14 rounded-xl bg-brand-amber/10 text-brand-amber flex items-center justify-center text-xl border border-brand-amber/10">
                        <FaMoneyBillWave />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-0.5">Cash Payments</p>
                        <h4 className="text-xl font-extrabold text-white">₹{cashRevenue}</h4>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="glass-premium rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white tracking-tight">Transaction History</h3>
                    <span className="text-xs font-bold text-zinc-400 bg-zinc-950 px-4 py-1.5 rounded-lg border border-white/5">{filteredTransactions.length} records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-950/40 text-[10px] text-zinc-500 uppercase tracking-widest border-b border-white/5">
                                <th className="p-5 font-bold">Order / Token</th>
                                <th className="p-5 font-bold">Date & Time</th>
                                <th className="p-5 font-bold">Payment Method</th>
                                <th className="p-5 font-bold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                                <tr key={tx._id} className="hover:bg-zinc-900/40 transition-colors">
                                    <td className="p-5 font-medium text-white">
                                        <div className="font-bold flex items-center gap-2">
                                            <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-0.5 rounded-lg text-xs font-bold">#{tx.tokenNumber}</span>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 mt-1.5 select-all">{tx._id}</div>
                                    </td>
                                    <td className="p-5 text-zinc-300 font-medium">
                                        <div>{new Date(tx.createdAt).toLocaleDateString()}</div>
                                        <div className="text-xs text-zinc-500 mt-0.5">{new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border ${tx.paymentMethod === 'Online' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'bg-brand-amber/10 text-brand-amber border-brand-amber/20'}`}>
                                            {tx.paymentMethod === 'Online' ? <FaCreditCard className="mr-1.5" /> : <FaMoneyBillWave className="mr-1.5" />}
                                            {tx.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="text-base font-extrabold text-white">₹{tx.totalAmount}</div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-zinc-500 font-medium text-sm">
                                        No transactions found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
