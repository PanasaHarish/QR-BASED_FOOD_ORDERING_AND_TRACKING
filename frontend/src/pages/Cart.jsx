import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaTrash, FaMinus, FaPlus, FaMoneyBillWave, FaCreditCard, FaShoppingCart, FaCheckCircle, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { getImageUrl } from '../utils/getImageUrl';
import TermsModal from '../components/TermsModal';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, total } = useContext(CartContext);
    const [orderType, setOrderType] = useState('Dine-in');
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState('');
    const [copied, setCopied] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const navigate = useNavigate();

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error('Cart is empty');
        if (!cart[0]?.restaurant) {
            toast.error('Your cart contains outdated items. Please clear your cart and add items again from the new QR menu.');
            return;
        }

        const customerPhone = localStorage.getItem('customerPhone');
        if (!customerPhone) {
            toast.error('Customer phone number is missing. Please return to the menu and enter it.');
            return;
        }

        if (!agreedToTerms) {
            toast.error('You must agree to the Terms and Conditions before placing your order.');
            return;
        }

        setIsProcessing(true);

        try {
            if (paymentMethod === 'Online') {
                const res = await loadRazorpay();
                if (!res) {
                    toast.error('Razorpay failed to load');
                    setIsProcessing(false);
                    return;
                }

                // Fetch Razorpay Key ID from backend
                const { data: configData } = await axios.get('/api/payment/config');
                const razorpayKeyId = configData.key_id;

                if (!razorpayKeyId || razorpayKeyId === 'placeholder_key_id' || razorpayKeyId === 'dummy_id') {
                    toast.error('Razorpay Key is not configured. Please contact the administrator.');
                    setIsProcessing(false);
                    return;
                }

                // Create placeholder order for razorpay amount calculation
                const { data: orderData } = await axios.post('/api/payment/create', { amount: total });

                const options = {
                    key: razorpayKeyId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'FoodCourt Restaurant',
                    description: 'Order Payment',
                    order_id: orderData.id,
                    handler: async function (response) {
                        try {
                            const verifyData = {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            };
                            
                            // Verify the payment signature on backend
                            const { data: verifyResponse } = await axios.post('/api/payment/verify', verifyData);
                            
                            if (verifyResponse.message === 'Payment verified successfully') {
                                const foodOrderRes = await axios.post('/api/orders', {
                                    items: cart.map(item => ({ menuItem: item.menuItem, name: item.name, quantity: item.quantity, price: item.price })),
                                    totalAmount: total,
                                    type: orderType,
                                    paymentMethod: 'Online',
                                    restaurant: cart[0]?.restaurant,
                                    customerPhone,
                                    paymentStatus: 'Paid'
                                });
                                
                                clearCart();
                                localStorage.setItem('activeOrderId', foodOrderRes.data._id);
                                setPlacedOrderId(foodOrderRes.data._id);
                                setOrderPlaced(true);
                            } else {
                                toast.error('Payment verification failed');
                                setIsProcessing(false);
                            }
                            
                        } catch (err) {
                            toast.error('Order creation failed after payment');
                            setIsProcessing(false);
                        }
                    },
                    prefill: { name: 'Customer', email: 'customer@foodcourt.com', contact: customerPhone },
                    theme: { color: '#f97316' },
                    modal: {
                        ondismiss: function() {
                            setIsProcessing(false);
                        }
                    }
                };
                
                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
                
                paymentObject.on('payment.failed', function (response){
                    toast.error('Payment failed: ' + response.error.description);
                    setIsProcessing(false);
                });

            } else {
                // Cash Payment
                const { data } = await axios.post('/api/orders', {
                    items: cart.map(item => ({ menuItem: item.menuItem, name: item.name, quantity: item.quantity, price: item.price })),
                    totalAmount: total,
                    type: orderType,
                    paymentMethod: 'Cash',
                    restaurant: cart[0]?.restaurant,
                    customerPhone
                });
                
                clearCart();
                localStorage.setItem('activeOrderId', data._id);
                setPlacedOrderId(data._id);
                setOrderPlaced(true);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || 'Checkout failed');
            setIsProcessing(false);
        } finally {
            if (paymentMethod === 'Cash') setIsProcessing(false);
        }
    };

    if (orderPlaced) {
        const trackingUrl = `${window.location.origin}/order/${placedOrderId}`;
        
        const copyToClipboard = () => {
            navigator.clipboard.writeText(trackingUrl);
            setCopied(true);
            toast.success('Tracking URL copied to clipboard!');
            setTimeout(() => setCopied(false), 3000);
        };

        return (
            <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 text-zinc-100 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="glass-premium p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-white/5 z-10 animate-fade-in-up">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-primary/20 shadow-md">
                        <FaCheckCircle className="text-4xl text-brand-primary animate-float" />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Order Confirmed!</h2>
                    <p className="text-zinc-400 text-xs font-medium mb-6">Your payment is complete and order has been successfully placed.</p>
                    
                    {/* URL copy card */}
                    <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 text-left mb-6 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Food Order Tracking Link</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                readOnly 
                                value={trackingUrl} 
                                className="flex-1 bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none truncate select-all"
                            />
                            <button 
                                onClick={copyToClipboard}
                                className="px-3.5 bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary/20 text-brand-primary rounded-lg transition-all flex items-center justify-center"
                                title="Copy Link"
                            >
                                <FaCopy className="text-sm text-white-force" />
                            </button>
                        </div>
                        {copied && (
                            <span className="text-[9px] font-bold text-brand-primary tracking-wide block animate-pulse">✓ Link copied! Share this link to track delivery.</span>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => navigate(`/order/${placedOrderId}`)}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <span>Go to Order Tracker</span>
                        <FaExternalLinkAlt className="text-[10px]" />
                    </button>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 text-zinc-100 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="glass-premium p-10 rounded-2xl shadow-2xl text-center max-w-md w-full border border-white/5 z-10 animate-fade-in-up">
                    <div className="w-24 h-24 bg-zinc-900/80 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-inner">
                        <FaShoppingCart className="text-4xl text-zinc-600" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white mb-3 tracking-tight animate-pulse-glow px-4 py-1.5 rounded-full inline-block">Your cart is empty</h2>
                    <p className="text-zinc-400 mb-8 text-sm">Looks like you haven't added any delicious food to your cart yet.</p>
                    <Link to="/menu" className="block w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95">
                        Browse Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-dark font-sans pb-32 text-zinc-100 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
                    <Link to="/menu" className="p-2 -ml-2 text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 rounded-xl transition-all mr-4">
                        <FaArrowLeft className="text-sm" />
                    </Link>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Checkout</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 relative z-10 animate-fade-in-up">
                {/* Order Items */}
                <div className="glass-premium rounded-2xl border border-white/5 p-6 shadow-xl">
                    <h3 className="text-lg font-extrabold text-white mb-6 tracking-tight flex items-center justify-between border-b border-white/5 pb-4">
                        <span>Your Order</span>
                        <span className="text-xs text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full font-bold">{cart.length} items</span>
                    </h3>
                    <div className="space-y-6">
                        {cart.map(item => (
                            <div key={item.menuItem} className="flex items-center gap-5 border-b border-white/5 pb-6 last:border-b-0 last:pb-0">
                                <img src={getImageUrl(item.image)} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-zinc-900 border border-white/5 shadow-md flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <h4 className="font-bold text-white text-base leading-tight truncate">{item.name}</h4>
                                        <button onClick={() => removeFromCart(item.menuItem)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all flex-shrink-0">
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </div>
                                    <p className="text-zinc-500 text-xs font-bold mb-3">₹{item.price}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center bg-zinc-950/80 border border-white/5 rounded-xl p-1 shadow-inner">
                                            <button onClick={() => updateQuantity(item.menuItem, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-zinc-400 font-bold hover:text-white hover:bg-white/5 rounded-lg transition-all"><FaMinus className="text-[10px]" /></button>
                                            <span className="w-8 text-center font-bold text-white text-sm">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.menuItem, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-zinc-400 font-bold hover:text-white hover:bg-white/5 rounded-lg transition-all"><FaPlus className="text-[10px]" /></button>
                                        </div>
                                        <div className="font-extrabold text-white text-base">₹{item.price * item.quantity}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 border-dashed flex justify-center">
                        <Link to="/menu" className="flex items-center gap-2 text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 hover:text-brand-secondary px-6 py-3 rounded-xl border border-brand-primary/20 hover:shadow-md transform hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-wider">
                            <FaPlus className="text-xs" /> Add More Items
                        </Link>
                    </div>
                </div>

                {/* Preferences */}
                <div className="glass-premium rounded-2xl border border-white/5 p-6 shadow-xl space-y-6">
                    <div>
                        <h3 className="text-base font-extrabold text-white mb-3.5 tracking-tight">Dining Preference</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {['Dine-in', 'Takeaway'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setOrderType(type)}
                                    className={`py-3 px-2 rounded-xl font-bold border text-xs transition-all duration-300 flex items-center justify-center gap-2 ${orderType === type ? 'border-brand-primary text-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/5' : 'border-white/5 text-zinc-400 bg-zinc-900/40 hover:bg-zinc-800/40 hover:text-white'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-base font-extrabold text-white mb-3.5 tracking-tight">Payment Method</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'Online', label: 'Pay Online', icon: <FaCreditCard /> },
                                { id: 'Cash', label: 'Cash at Counter', icon: <FaMoneyBillWave /> }
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`py-3.5 px-2 rounded-xl font-bold border text-xs transition-all duration-300 flex flex-col items-center justify-center gap-2 ${paymentMethod === method.id ? 'border-brand-primary text-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/5' : 'border-white/5 text-zinc-400 bg-zinc-900/40 hover:bg-zinc-800/40 hover:text-white'}`}
                                >
                                    <span className="text-lg">{method.icon}</span>
                                    <span>{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="glass-premium text-white rounded-2xl shadow-xl p-6 border border-white/5 space-y-4">
                    <h3 className="text-base font-bold mb-4 tracking-tight border-b border-white/5 pb-4">Bill Summary</h3>
                    <div className="flex justify-between text-zinc-400 text-sm font-medium">
                        <span>Item Total</span>
                        <span className="text-white font-bold">₹{total}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-sm font-medium pb-4 border-b border-white/5">
                        <span>Taxes & Fees</span>
                        <span className="text-white font-bold">₹0</span>
                    </div>
                    <div className="flex justify-between text-lg font-extrabold text-white pt-2">
                        <span>Grand Total</span>
                        <span className="text-brand-primary">₹{total}</span>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="glass-premium rounded-2xl border border-white/5 p-5 shadow-xl flex items-start gap-3 transition-all hover:border-white/10">
                    <input 
                        type="checkbox" 
                        id="terms" 
                        checked={agreedToTerms} 
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 accent-brand-primary cursor-pointer w-4 h-4 rounded border-white/10 bg-zinc-900/50"
                    />
                    <label htmlFor="terms" className="text-xs text-zinc-400 font-semibold leading-relaxed cursor-pointer select-none">
                        I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-brand-primary hover:text-brand-secondary underline font-bold focus:outline-none cursor-pointer transition-colors">Terms & Conditions</button> and the refund/cancellation policy.
                    </label>
                </div>
            </div>

            {/* Sticky Action Button Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-zinc-950/85 backdrop-blur-md border-t border-white/5 z-40 lg:hidden">
                <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-brand-primary/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed justify-center flex"
                >
                    {isProcessing ? 'Processing...' : `Place Order (₹${total})`}
                </button>
            </div>
            
            {/* Sticky Action Button Desktop */}
            <div className="hidden lg:block fixed bottom-0 left-0 right-0 p-4 pb-6 z-40 pointer-events-none">
                <div className="max-w-3xl mx-auto flex justify-end pointer-events-auto">
                    <button 
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-80 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-2xl shadow-brand-primary/20 hover:brightness-110 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center"
                    >
                        {isProcessing ? 'Processing...' : `Place Order (₹${total})`}
                    </button>
                </div>
            </div>

            <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
        </div>
    );
};

export default Cart;
