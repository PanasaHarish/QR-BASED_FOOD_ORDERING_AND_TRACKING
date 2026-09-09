import React from 'react';
import { FaTimes } from 'react-icons/fa';

const TermsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fade-in">
            <div className="glass-premium p-6 sm:p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-white/10 relative z-[201] animate-fade-in-up flex flex-col max-h-[85vh] text-zinc-800">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-full transition-all"
                    aria-label="Close modal"
                >
                    <FaTimes className="text-xs" />
                </button>

                <h3 className="text-xl font-extrabold text-zinc-900 mb-2 tracking-tight">Terms & Conditions</h3>
                <p className="text-zinc-500 text-xs font-medium mb-6">Please read our terms and cancellation policy carefully.</p>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-zinc-600 leading-relaxed font-sans scrollbar-thin">
                    <div>
                        <h4 className="font-bold text-zinc-800 mb-1 uppercase tracking-wider text-[10px]">1. Order Placement & Acceptance</h4>
                        <p>Placing an order initiates a request to the restaurant. The order is only confirmed and prepared after the restaurant accepts it on their owner dashboard. If rejected, you will be notified with a cancellation reason.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-800 mb-1 uppercase tracking-wider text-[10px]">2. Payment Terms</h4>
                        <p>We support online payments via Razorpay and Cash payments. Cash payments must be settled at the counter. For online payments, transaction details are securely processed.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-800 mb-1 uppercase tracking-wider text-[10px]">3. Cancellation & Refund Policy</h4>
                        <p>Once an order has been accepted and preparation has started at the restaurant kitchen, it cannot be cancelled, and refunds will not be issued. If an order is rejected by the restaurant prior to acceptance, any online payment will be initiated for a refund.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-800 mb-1 uppercase tracking-wider text-[10px]">4. Allergies & Food Hygiene</h4>
                        <p>Ingredients and allergen details are provided for reference. If you have severe allergies, please notify the restaurant staff directly before placing your order.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-zinc-800 mb-1 uppercase tracking-wider text-[10px]">5. Service Limits</h4>
                        <p>This service is intended for dine-in or takeaway at our designated tables. Please verify you have scanned the correct table QR code to ensure your order is delivered to the correct location.</p>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-200/50">
                    <button 
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3.5 rounded-xl hover:brightness-110 shadow-lg shadow-brand-primary/25 transition-all text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Accept & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
