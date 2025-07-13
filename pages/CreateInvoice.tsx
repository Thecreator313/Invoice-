import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Invoice, ServiceItem } from '../types';
import { InvoiceStatus } from '../types';
import { addInvoice } from '../services/invoiceService';

const SHOP_NAME = "Ozone Graphics";
const GPAY_NUMBER = "9744460317"; // Placeholder

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.684H7.08a.75.75 0 01-.749-.684L5.33 6.66l-.21.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9zM12 1.978c-1.12 0-2.016.916-2.016 2.016v.227a49.913 49.913 0 014.032 0v-.227c0-1.1-.896-2.016-2.016-2.016zM6.75 8.25c.247 0 .47.033.685.094l.805 10.468a.75.75 0 00.744.688h5.032a.75.75 0 00.744-.688l.805-10.468a.75.75 0 00-.685-.842A49.333 49.333 0 0012 8.25c-1.22 0-2.417.04-3.585.118a.75.75 0 00-.665.642z" clipRule="evenodd" />
    </svg>
);

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<ServiceItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 },
  ]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentSubtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    setSubtotal(currentSubtotal);
    const finalTotal = currentSubtotal - discount;
    setTotal(finalTotal > 0 ? finalTotal : 0);
  }, [items, discount]);

  const handleItemChange = (id: string, field: keyof Omit<ServiceItem, 'id'>, value: string | number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newInvoice: Omit<Invoice, 'id'> = {
      clientName,
      issueDate,
      dueDate,
      items,
      subtotal,
      discount,
      total,
      status: InvoiceStatus.Unpaid,
      paidAmount: 0,
      shopName: SHOP_NAME,
      gPayNumber: GPAY_NUMBER,
      createdAt: Date.now(),
    };

    try {
      const newInvoiceId = await addInvoice(newInvoice);
      navigate(`/invoice/${newInvoiceId}`);
    } catch (error) {
      console.error("Failed to create invoice:", error);
      alert("There was an error saving the invoice. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  const inputClasses = "w-full bg-base-300 text-content-100 border border-base-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-primary transition";

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold mb-6">New Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-base-200 p-6 rounded-lg border border-base-300">
            <h2 className="text-xl font-bold mb-4">Client Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-content-200 mb-2">Client Name</label>
                    <input type="text" id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="issueDate" className="block text-sm font-medium text-content-200 mb-2">Issue Date</label>
                    <input type="date" id="issueDate" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-content-200 mb-2">Due Date</label>
                    <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClasses} required />
                </div>
            </div>
        </div>

        <div className="bg-base-200 p-6 rounded-lg border border-base-300">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <div className="space-y-4 mb-4">
            {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <input type="text" placeholder="Service Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className={`col-span-12 md:col-span-6 ${inputClasses}`} required />
                <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))} className={`col-span-4 md:col-span-2 ${inputClasses}`} required min="1" />
                <input type="number" placeholder="Price" value={item.price} onChange={e => handleItemChange(item.id, 'price', Number(e.target.value))} className={`col-span-5 md:col-span-3 ${inputClasses}`} required min="0" step="0.01" />
                <button type="button" onClick={() => removeItem(item.id)} className="col-span-3 md:col-span-1 text-content-muted hover:text-red-500 transition-colors">
                    <TrashIcon className="w-6 h-6 mx-auto"/>
                </button>
                </div>
            ))}
            </div>
            <button type="button" onClick={addItem} className="w-full bg-base-300 hover:bg-neutral text-content-100 font-semibold py-3 px-4 rounded-md transition-colors">
            + Add Service
            </button>
        </div>

        <div className="bg-base-200 p-6 rounded-lg border border-base-300">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-content-200">Subtotal</span>
                    <span className="font-semibold text-content-100">${subtotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <label htmlFor="discount" className="text-content-200">Discount</label>
                    <div className="flex items-center">
                        <span className="text-content-200 mr-2">$</span>
                        <input type="number" id="discount" value={discount} onChange={e => setDiscount(Number(e.target.value))} className={`${inputClasses} !p-2 w-28 text-right`} placeholder="0.00" min="0" />
                    </div>
                </div>
                 <div className="flex justify-between items-center text-2xl font-bold border-t border-base-300 pt-4 mt-2">
                    <span className="text-content-100">Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <div className="flex justify-end items-center gap-4">
            <button type="button" onClick={() => navigate(-1)} className="bg-base-300 text-content-100 font-bold py-3 px-8 rounded-lg hover:bg-neutral transition-colors">
                Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-focus disabled:bg-neutral disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? 'Saving...' : 'Save Invoice'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;