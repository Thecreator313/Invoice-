import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../services/invoiceService';
import type { Invoice } from '../types';
import { InvoiceStatus } from '../types';

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const baseClasses = "text-xs font-bold mr-2 px-3 py-1 rounded-full";
  const statusColors: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Paid]: "bg-green-500/10 text-green-400",
    [InvoiceStatus.Unpaid]: "bg-red-500/10 text-red-400",
    [InvoiceStatus.PartiallyPaid]: "bg-yellow-500/10 text-yellow-400",
  };
  return <span className={`${baseClasses} ${statusColors[status]}`}>{status}</span>;
};

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M3.75 4.5a.75.75 0 01.75-.75h9a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V5.25h-7.5v13.5h7.5V18a.75.75 0 011.5 0v2.25a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75V4.5z" clipRule="evenodd" /><path fillRule="evenodd" d="M19.5 10.5a.75.75 0 01-.75.75H13.5a.75.75 0 010-1.5h5.25a.75.75 0 01.75.75zm0 3a.75.75 0 01-.75.75H13.5a.75.75 0 010-1.5h5.25a.75.75 0 01.75.75zm0 3a.75.75 0 01-.75.75H13.5a.75.75 0 010-1.5h5.25a.75.75 0 01.75.75z" clipRule="evenodd" /></svg>);

const Dashboard = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedInvoices = await getInvoices();
      setInvoices(fetchedInvoices);
    } catch (err) {
      setError("Failed to fetch invoices. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const { totalOutstanding, totalRevenue } = useMemo(() => {
    return invoices.reduce(
      (acc, inv) => {
        acc.totalOutstanding += inv.total - inv.paidAmount;
        if (inv.status === InvoiceStatus.Paid) {
          acc.totalRevenue += inv.total;
        } else {
           acc.totalRevenue += inv.paidAmount;
        }
        return acc;
      },
      { totalOutstanding: 0, totalRevenue: 0 }
    );
  }, [invoices]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA');
  }

  return (
    <div className="w-full">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-content-100">Dashboard</h1>
        <p className="text-content-200">Welcome to Ozone Graphics Invoicing</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-base-200 p-4 rounded-xl border border-base-300">
            <h2 className="font-semibold text-content-200">Total Outstanding</h2>
            <p className="text-2xl font-bold text-accent">${totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="bg-base-200 p-4 rounded-xl border border-base-300">
            <h2 className="font-semibold text-content-200">Total Revenue</h2>
            <p className="text-2xl font-bold text-secondary">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-content-100 mb-4">Recent Invoices</h2>

      {loading && <p className="text-center text-content-200">Loading invoices...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      
      {!loading && !error && (
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="text-center py-16 px-4 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
                <DocumentIcon className="w-12 h-12 mx-auto text-content-muted" />
                <h2 className="text-xl font-medium text-content-100 mt-4">No invoices yet</h2>
                <p className="text-content-200 mt-2">Click 'New Invoice' below to get started.</p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <Link to={`/invoice/${invoice.id}`} key={invoice.id} className="block bg-base-200 p-4 rounded-xl shadow-md hover:bg-base-300 transition-colors duration-200 border border-base-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg text-content-100">{invoice.clientName}</p>
                    <p className="text-sm text-content-200">Due: {formatDate(invoice.dueDate)}</p>
                  </div>
                  <StatusBadge status={invoice.status} />
                </div>
                <div className="mt-4 flex justify-between items-end">
                    <p className="text-sm text-content-muted">INV-{invoice.id.substring(0,6)}</p>
                    <p className="text-2xl font-semibold text-content-100">
                      ${invoice.total.toFixed(2)}
                    </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;