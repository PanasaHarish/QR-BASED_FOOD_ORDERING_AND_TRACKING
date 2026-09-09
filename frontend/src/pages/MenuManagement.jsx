import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaImage, FaQrcode, FaCheck } from 'react-icons/fa';
import { getImageUrl } from '../utils/getImageUrl';

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', price: '', category: 'Veg', isAvailable: true, isVeg: true });
    const [selectedCategoryDropdown, setSelectedCategoryDropdown] = useState('Veg');
    const [imageFile, setImageFile] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showQRModal, setShowQRModal] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [menuDietFilter, setMenuDietFilter] = useState('All');

    const fetchMenu = async () => {
        try {
            const token = localStorage.getItem('ownerToken');
            const { data } = await axios.get('/api/menu/owner', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMenuItems(data);
        } catch (error) {
            toast.error('Failed to load menu');
        }
    };

    useEffect(() => { fetchMenu(); }, []);

    const generateQR = () => {
        setQrCodeUrl('');
        setShowQRModal(true);
    };

    const handleFetchQR = async () => {
        try {
            const token = localStorage.getItem('ownerToken');
            const frontendUrl = encodeURIComponent(window.location.origin);
            let url = `/api/qr?frontend=${frontendUrl}`;
            if (tableNumber) {
                url += `&table=${encodeURIComponent(tableNumber)}`;
            }
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQrCodeUrl(data.qrCodeUrl);
        } catch (error) {
            toast.error('Failed to generate QR Code');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('ownerToken');

        if (imageFile && imageFile.size > 2 * 1024 * 1024) {
            return toast.error('Menu image size must be less than 2MB');
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
            let base64Image = '';
            if (imageFile) {
                base64Image = await convertToBase64(imageFile);
            }

            const payload = {
                name: formData.name,
                price: formData.price,
                category: formData.category,
                isAvailable: formData.isAvailable,
                isVeg: formData.isVeg,
                image: base64Image
            };

            if (isEditing) {
                if (!imageFile) {
                    delete payload.image;
                }
                await axios.put(`/api/menu/${formData.id}`, payload, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                toast.success('Item updated successfully');
            } else {
                if (!imageFile) return toast.error('Please select an image');
                await axios.post('/api/menu', payload, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                toast.success('Item added successfully');
            }
            setFormData({ id: '', name: '', price: '', category: 'Veg', isAvailable: true, isVeg: true });
            setSelectedCategoryDropdown('Veg');
            setImageFile(null);
            setIsEditing(false);
            fetchMenu();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        const isPreset = ['Veg', 'Non-Veg', 'Starters'].includes(item.category);
        setSelectedCategoryDropdown(isPreset ? item.category : 'Others');
        setFormData({ id: item._id, name: item.name, price: item.price, category: item.category, isAvailable: item.isAvailable, isVeg: item.isVeg !== undefined ? item.isVeg : true });
        setImageFile(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const token = localStorage.getItem('ownerToken');
                await axios.delete(`/api/menu/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Item deleted');
                fetchMenu();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-5 glass-premium p-6 sm:p-8 rounded-2xl shadow-xl text-white relative overflow-hidden border border-white/5">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Management Dashboard</span>
                    <h2 className="text-2xl font-extrabold tracking-tight mt-1 mb-2">Menu Management</h2>
                    <p className="text-zinc-400 text-sm font-medium">Curate your offerings and generate your storefront table QR codes.</p>
                </div>
                <div className="relative z-10 flex items-center space-x-4">
                    <button onClick={generateQR} className="flex items-center space-x-3 bg-zinc-900 border border-white/5 text-zinc-100 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 hover:-translate-y-0.5 transition-all shadow-md">
                        <FaQrcode className="text-base text-brand-primary" /> <span>Generate QR</span>
                    </button>
                </div>
            </div>

            <div className="glass-premium p-6 md:p-8 rounded-2xl shadow-xl border border-white/5 relative transition-all">
                <div className="flex items-center space-x-4 mb-6 border-b border-white/5 pb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${isEditing ? 'bg-brand-amber/15 text-brand-amber shadow-brand-amber/10' : 'bg-brand-primary/15 text-brand-primary shadow-brand-primary/10'}`}>
                        {isEditing ? <FaEdit /> : <FaPlus />}
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{isEditing ? 'Edit Menu Item' : 'Add New Item'}</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Item Name</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all font-medium text-white placeholder-zinc-600 text-sm" placeholder="E.g., Margherita Pizza" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Price (₹)</label>
                            <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all font-medium text-white placeholder-zinc-600 text-sm" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Category</label>
                            <select 
                                value={selectedCategoryDropdown}
                                onChange={e => {
                                    const val = e.target.value;
                                    setSelectedCategoryDropdown(val);
                                    if (val !== 'Others') {
                                        setFormData(prev => ({ ...prev, category: val }));
                                    } else {
                                        setFormData(prev => ({ ...prev, category: '' }));
                                    }
                                }}
                                className="w-full px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all font-semibold text-white text-sm"
                            >
                                <option value="Veg" className="bg-zinc-950 text-white">Veg</option>
                                <option value="Non-Veg" className="bg-zinc-950 text-white">Non-Veg</option>
                                <option value="Starters" className="bg-zinc-950 text-white">Starters</option>
                                <option value="Others" className="bg-zinc-950 text-white">Others</option>
                            </select>
                            {selectedCategoryDropdown === 'Others' && (
                                <div className="mt-3 animate-fade-in-up">
                                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wide">Enter Custom Category</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.category} 
                                        onChange={e => setFormData({ ...formData, category: e.target.value })} 
                                        className="w-full px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all font-medium text-white placeholder-zinc-600 text-sm" 
                                        placeholder="E.g., Desserts, Drinks" 
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Image {isEditing && <span className="normal-case font-normal text-zinc-500">(Optional)</span>}</label>
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl outline-none file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer text-zinc-500 transition-all font-medium focus:outline-none text-sm" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
                        <label htmlFor="veg" className={`flex-1 flex items-center p-4 rounded-xl border cursor-pointer transition-all ${formData.isVeg ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-zinc-900/40 border-white/5 text-zinc-400'}`}>
                            <input type="checkbox" id="veg" checked={formData.isVeg} onChange={e => setFormData({ ...formData, isVeg: e.target.checked })} className="w-5 h-5 text-green-500 rounded focus:ring-green-500/20 mr-4 accent-green-600" />
                            <div>
                                <p className="font-bold text-sm">Vegetarian</p>
                                <p className="text-[10px] text-zinc-500 font-medium">100% pure veg item</p>
                            </div>
                        </label>
                        {isEditing && (
                            <label htmlFor="available" className={`flex-1 flex items-center p-4 rounded-xl border cursor-pointer transition-all ${formData.isAvailable ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary' : 'bg-zinc-900/40 border-white/5 text-zinc-400'}`}>
                                <input type="checkbox" id="available" checked={formData.isAvailable} onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })} className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary/20 mr-4 accent-brand-primary" />
                                <div>
                                    <p className="font-bold text-sm">In Stock</p>
                                    <p className="text-[10px] text-zinc-500 font-medium">Currently available to customers</p>
                                </div>
                            </label>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-white/5">
                        <button type="submit" className="flex-1 flex justify-center items-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:brightness-110 hover:shadow-lg hover:shadow-brand-primary/20 hover:-translate-y-0.5 transition-all w-full">
                            {isEditing ? <FaEdit className="text-sm" /> : <FaPlus className="text-sm" />} <span>{isEditing ? 'Save Changes' : 'Add to Menu'}</span>
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', price: '', category: '', isAvailable: true, isVeg: true }); }} className="flex-[0.5] py-3.5 rounded-xl font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all w-full text-center text-sm">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Filter control bar */}
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4 max-w-4xl mx-auto mb-6 border-b border-white/5 pb-4 w-full">
                <h3 className="text-lg font-bold text-white tracking-tight">Menu Directory</h3>
                <div className="flex items-center space-x-1.5 bg-zinc-950 p-1.5 rounded-xl border border-white/5 max-w-full overflow-x-auto scrollbar-none">
                    {['All', 'Veg', 'Non-Veg', ...new Set(menuItems.map(item => item.category))].map(filterOpt => (
                        <button
                            key={filterOpt}
                            type="button"
                            onClick={() => setMenuDietFilter(filterOpt)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                                menuDietFilter === filterOpt
                                ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/10'
                                : 'text-zinc-500 hover:text-white hover:bg-zinc-800/20'
                            }`}
                        >
                            {filterOpt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grouped menu items */}
            <div className="space-y-10 max-w-4xl mx-auto">
                {(() => {
                    const filteredMenuItems = menuItems.filter(item => {
                        if (menuDietFilter === 'Veg') return item.isVeg !== false;
                        if (menuDietFilter === 'Non-Veg') return item.isVeg === false;
                        if (menuDietFilter !== 'All') return item.category === menuDietFilter;
                        return true;
                    });
                    const menuCategories = [...new Set(filteredMenuItems.map(item => item.category))];

                    if (menuCategories.length === 0) {
                        return <div className="text-center py-12 text-zinc-500 text-sm font-medium">No menu items found.</div>;
                    }

                    return menuCategories.map(cat => {
                        const catItems = filteredMenuItems.filter(item => item.category === cat);
                        return (
                            <div key={cat} className="space-y-4 animate-fade-in-up">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-l-2 border-brand-primary pl-2.5 mb-2.5">
                                    {cat} ({catItems.length})
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {catItems.map(item => (
                                        <div key={item._id} className={`glass-premium rounded-2xl p-4 border transition-all duration-300 flex gap-4 group ${
                                            !item.isAvailable ? 'opacity-50 grayscale hover:grayscale-0' : 'hover:border-white/10 border-white/5'
                                        }`}>
                                            {/* Image side */}
                                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/5">
                                                <img src={getImageUrl(item.image)} alt={item.name} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur-md p-1.5 rounded-lg shadow-md border border-white/10">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${item.isVeg === false ? 'bg-red-500' : 'bg-green-500'}`} title={item.isVeg === false ? 'Non-Veg' : 'Veg'}></div>
                                                </div>
                                                {!item.isAvailable && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                                                        <span className="bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-lg border border-white/5">Sold Out</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Content side */}
                                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                                <div>
                                                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight mb-1 line-clamp-2 group-hover:text-brand-primary transition-colors">{item.name}</h3>
                                                    <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded inline-block tracking-wider uppercase">{item.category}</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between mt-auto pt-2">
                                                    <div className="text-sm font-extrabold text-white tracking-tight bg-zinc-800 border border-white/5 px-3 py-1 rounded-lg">₹{item.price}</div>
                                                    
                                                    <div className="flex space-x-1.5 sm:space-x-2">
                                                        <button onClick={() => handleEdit(item)} className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all flex items-center justify-center shadow-sm" title="Edit">
                                                            <FaEdit className="sm:mr-1.5 text-sm" /> <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">Edit</span>
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id)} className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center shadow-sm" title="Delete">
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    });
                })()}
            </div>

            {showQRModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="glass-premium p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative pointer-events-auto border border-white/10 transform scale-100 overflow-hidden">
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                        <button onClick={() => { setShowQRModal(false); setTableNumber(''); setQrCodeUrl(''); }} className="absolute top-5 right-6 text-zinc-400 hover:text-white text-xl font-bold transition-colors w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center hover:bg-zinc-800 z-10">×</button>
                        
                        <div className="w-16 h-16 bg-brand-primary/15 rounded-xl flex items-center justify-center mx-auto mb-5 relative z-10 border border-brand-primary/20 shadow-md">
                            <FaQrcode className="text-3xl text-brand-primary" />
                        </div>
                        
                        <h3 className="text-lg font-extrabold text-white mb-1.5 tracking-tight relative z-10">Generate QR Code</h3>
                        <p className="text-zinc-400 text-[11px] font-medium mb-5 px-4 relative z-10">Generate a table-specific QR code for your restaurant, or leave empty for storefront QR.</p>
                        
                        <div className="mb-4 text-left relative z-10">
                            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Table Number (Optional)</label>
                            <input 
                                type="text" 
                                value={tableNumber} 
                                onChange={e => setTableNumber(e.target.value)} 
                                placeholder="E.g., 5"
                                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-white font-semibold text-sm placeholder-zinc-650" 
                            />
                        </div>

                        <button onClick={handleFetchQR} className="w-full mb-6 relative z-10 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-brand-primary font-bold py-2.5 rounded-xl transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2">
                            Generate QR Code
                        </button>

                        {qrCodeUrl ? (
                            <div className="animate-fade-in-up">
                                <div className="bg-white p-4 rounded-xl border border-white/5 shadow-inner mb-5 mx-auto inline-block relative z-10 group">
                                    <img src={qrCodeUrl} alt="Store QR Code" className="w-44 h-44 object-contain transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                
                                <p className="text-brand-primary text-xs font-bold mb-4 relative z-10">
                                    {tableNumber ? `Table ${tableNumber} QR Code Ready` : 'General Storefront QR Code Ready'}
                                </p>

                                <a 
                                    href={qrCodeUrl} 
                                    download={tableNumber ? `table-${tableNumber}-qr.png` : 'storefront-qr.png'} 
                                    className="w-full relative z-10 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 rounded-xl hover:brightness-110 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all flex justify-center uppercase tracking-wider text-xs"
                                >
                                    Download QR Code
                                </a>
                            </div>
                        ) : (
                            <div className="py-6 text-zinc-500 text-xs font-semibold relative z-10 italic border border-dashed border-white/5 rounded-xl">
                                Enter parameters and click generate.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
