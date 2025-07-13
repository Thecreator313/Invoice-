import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoice, updateInvoice } from '../services/invoiceService';
import { generateThankYouMessage } from '../services/geminiService';
import type { Invoice } from '../types';
import { InvoiceStatus } from '../types';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

// --- Helper Icons ---
const BackIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>);
const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 4.186m0-4.186a2.25 2.25 0 110 4.186m2.25-4.186a2.25 2.25 0 000 4.186m-4.5 0h.008c.004 0 .007.002.011.002h.005a2.25 2.25 0 011.834 1.086m-6.75 0a2.25 2.25 0 000 4.186m0-4.186a2.25 2.25 0 012.228 1.956m-2.228-1.956L3.25 13.5m10.5-1.125a2.25 2.25 0 000 4.186m0-4.186a2.25 2.25 0 012.228 1.956m-2.228-1.956l-2.25 2.25m15-3.375a2.25 2.25 0 00-4.5 0m4.5 0a2.25 2.25 0 01-2.25 2.25m2.25-2.25a2.25 2.25 0 01-2.25 2.25m0 0l-2.25 2.25m0 0a2.25 2.25 0 01-2.25-2.25m2.25 2.25a2.25 2.25 0 012.25-2.25" /></svg>);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>);
const UpdateIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-14.85 0l3.181-3.182m0 0a8.25 8.25 0 0111.664 0l3.18 3.185" /></svg>);

// --- Helper Components ---

const InvoicePreview: React.FC<{ invoice: Invoice, refProp: React.Ref<HTMLDivElement> }> = ({ invoice, refProp }) => (
    <div ref={refProp} className="bg-white text-gray-800 p-10 shadow-lg" id="invoice-preview">
        <div className="border-t-8 border-primary -mx-10 -mt-10 mb-8"></div>
        <header className="flex justify-between items-start pb-6">
            <div>
                <h1 className="text-4xl font-bold text-gray-900">{invoice.shopName}</h1>
                <p className="text-gray-500">Invoice / Bill</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-gray-500">INVOICE</p>
                <p className="text-sm text-gray-600"># {invoice.id.substring(0, 8).toUpperCase()}</p>
            </div>
        </header>
        <section className="grid grid-cols-2 gap-8 my-10">
            <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Billed To</h2>
                <p className="font-bold text-lg text-gray-800">{invoice.clientName}</p>
            </div>
            <div className="text-right">
                 <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Details</h2>
                 <p className="text-gray-700"><span className="font-semibold">Date of Issue:</span> {new Date(invoice.issueDate).toLocaleDateString()}</p>
                 <p className="text-gray-700"><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
        </section>
        <section>
            <table className="w-full text-left">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                        <th className="p-4 text-sm font-semibold text-gray-600 text-center uppercase tracking-wider">Qty</th>
                        <th className="p-4 text-sm font-semibold text-gray-600 text-right uppercase tracking-wider">Price</th>
                        <th className="p-4 text-sm font-semibold text-gray-600 text-right uppercase tracking-wider">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {invoice.items.map(item => (
                        <tr key={item.id}>
                            <td className="p-4 font-medium">{item.description}</td>
                            <td className="p-4 text-center text-gray-600">{item.quantity}</td>
                            <td className="p-4 text-right text-gray-600">${item.price.toFixed(2)}</td>
                            <td className="p-4 text-right font-medium">${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
        <section className="flex justify-end mt-8">
            <div className="w-full max-w-sm text-gray-700">
                <div className="flex justify-between py-2">
                    <span >Subtotal:</span>
                    <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                     <div className="flex justify-between py-2">
                        <span>Discount:</span>
                        <span className="font-medium text-green-600">-${invoice.discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-gray-200 mt-2 pt-2">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">${invoice.total.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between py-2">
                    <span>Amount Paid:</span>
                    <span className="font-medium">${invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-xl font-bold bg-gray-100 p-3 rounded-lg mt-2">
                    <span>Amount Due:</span>
                    <span>${(invoice.total - invoice.paidAmount).toFixed(2)}</span>
                </div>
            </div>
        </section>
        <footer className="text-center text-sm text-gray-500 mt-16 pt-6 border-t">
            <p className="font-semibold">Payment Information</p>
            <p>GPay: {invoice.gPayNumber}</p>
            <p className="mt-4">Thank you for your business!</p>
        </footer>
    </div>
);

const UpdateStatusModal: React.FC<{
    invoice: Invoice;
    onClose: () => void;
    onUpdate: (status: InvoiceStatus, paidAmount: number) => void;
}> = ({ invoice, onClose, onUpdate }) => {
    const [paidAmount, setPaidAmount] = useState(invoice.paidAmount);

    const handleSave = () => {
        const numericPaidAmount = Number(paidAmount);
        let newStatus = InvoiceStatus.Unpaid;
        if (numericPaidAmount >= invoice.total) {
            newStatus = InvoiceStatus.Paid;
        } else if (numericPaidAmount > 0) {
            newStatus = InvoiceStatus.PartiallyPaid;
        }
        onUpdate(newStatus, numericPaidAmount);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-base-200 p-6 rounded-lg w-full max-w-sm border border-base-300">
                <h2 className="text-xl font-bold mb-4">Update Payment</h2>
                <div className="mb-4">
                    <label htmlFor="paidAmount" className="block text-sm font-medium text-content-200 mb-1">Amount Paid</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-content-200">$</span>
                        <input
                            type="number"
                            id="paidAmount"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(Number(e.target.value))}
                            className="w-full bg-base-300 text-content-100 rounded-md p-2 pl-7 border border-base-300 focus:ring-primary focus:border-primary"
                            max={invoice.total}
                            min="0"
                        />
                    </div>
                </div>
                <p className="text-sm text-content-200 mb-4">Total Amount: ${invoice.total.toFixed(2)}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="bg-base-300 px-4 py-2 rounded-lg font-semibold hover:bg-neutral">Cancel</button>
                    <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-focus">Save</button>
                </div>
            </div>
        </div>
    );
};


const ThankYouCard: React.FC<{ invoice: Invoice, thankYouMessage: string, refProp: React.Ref<HTMLDivElement> }> = ({ invoice, thankYouMessage, refProp }) => {
    const remaining = invoice.total - invoice.paidAmount;
    return (
        <div ref={refProp} className="bg-gradient-to-br from-primary to-indigo-800 text-white p-8 rounded-lg shadow-xl" id="thankyou-card">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold">Thank You!</h2>
                <p className="text-indigo-200 mt-1">{invoice.shopName}</p>
            </div>
            <p className="text-center text-lg mb-6 italic">"{thankYouMessage}"</p>
            <div className="bg-white/10 p-4 rounded-lg text-sm">
                <div className="flex justify-between items-center py-1">
                    <span className="text-indigo-200">Total Invoice:</span>
                    <span className="font-semibold">${invoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-green-300 font-bold">
                    <span >Amount Paid:</span>
                    <span>${invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/20 mt-1">
                    <span className="text-indigo-200">Balance Due:</span>
                    <span className="font-semibold">${remaining.toFixed(2)}</span>
                </div>
            </div>
            <p className="text-center text-xs text-indigo-300 mt-6">Receipt for Invoice #{invoice.id.substring(0, 8)}</p>
        </div>
    );
};

// --- Main ViewInvoice Component ---

const ViewInvoice = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [thankYouMessage, setThankYouMessage] = useState('');
    
    const invoiceRef = useRef<HTMLDivElement>(null);
    const thankYouCardRef = useRef<HTMLDivElement>(null);
    
    const fetchInvoiceData = useCallback(async () => {
        if (!id) {
            setError("No invoice ID provided.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getInvoice(id);
            if (data) {
                setInvoice(data);
            } else {
                setError("Invoice not found.");
            }
        } catch (err) {
            setError("Failed to fetch invoice.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchInvoiceData();
    }, [fetchInvoiceData]);

    const handleGeneratePdf = async () => {
        const { jsPDF } = window.jspdf;
        const canvas = await window.html2canvas(invoiceRef.current!, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.output('dataurlnewwindow');
    };

    const handleUpdate = async (status: InvoiceStatus, paidAmount: number) => {
        if (!invoice) return;
        try {
            await updateInvoice(invoice.id, { status, paidAmount });
            const msg = await generateThankYouMessage(invoice.clientName, invoice.shopName);
            setThankYouMessage(msg);
            setIsModalOpen(false);
            setShowThankYou(true);
            fetchInvoiceData(); // Refresh data
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Error updating status. Please try again.");
        }
    };
    
    const handleDownloadReceipt = async () => {
        const canvas = await window.html2canvas(thankYouCardRef.current!, { backgroundColor: null, scale: 2 });
        const link = document.createElement('a');
        link.download = `receipt-ozone-${invoice?.id.substring(0,6)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    if (loading) return <p className="text-center py-10">Loading invoice...</p>;
    if (error) return <p className="text-center py-10 text-red-400">{error}</p>;
    if (!invoice) return <p className="text-center py-10">Invoice could not be loaded.</p>;

    return (
        <div>
            <nav className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-content-200 hover:text-content-100 transition-colors">
                    <BackIcon className="w-6 h-6" />
                    Back to Dashboard
                </button>
            </nav>

            {showThankYou ? (
                <div className="space-y-4">
                    <ThankYouCard invoice={invoice} thankYouMessage={thankYouMessage} refProp={thankYouCardRef} />
                    <button onClick={handleDownloadReceipt} className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors">
                        <DownloadIcon className="w-5 h-5"/> Download Receipt
                    </button>
                    <button onClick={() => setShowThankYou(false)} className="w-full text-center py-2 text-content-200 hover:text-content-100">
                        View Full Invoice
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-base-200 rounded-lg overflow-hidden border border-base-300">
                         {/* This wrapper is for the white background to show up */}
                        <div className="bg-white">
                            <InvoicePreview invoice={invoice} refProp={invoiceRef} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                           <UpdateIcon className="w-5 h-5"/> Update Status
                        </button>
                        <button onClick={handleGeneratePdf} className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-colors">
                            <ShareIcon className="w-5 h-5"/> Share as PDF
                        </button>
                    </div>
                </div>
            )}
            
            {isModalOpen && <UpdateStatusModal invoice={invoice} onClose={() => setIsModalOpen(false)} onUpdate={handleUpdate} />}
        </div>
    );
};

export default ViewInvoice;