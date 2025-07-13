
import { db } from '../firebase';
import { InvoiceStatus } from '../types';
import type { Invoice, ServiceItem } from '../types';

const invoicesCollection = db.collection('invoices');

export const addInvoice = async (invoiceData: Omit<Invoice, 'id'>): Promise<string> => {
  const docRef = await invoicesCollection.add(invoiceData);
  return docRef.id;
};

export const getInvoices = async (): Promise<Invoice[]> => {
    const snapshot = await invoicesCollection.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => {
        const data = doc.data() || {};
        
        const items: ServiceItem[] = (data.items || []).map((item: Partial<ServiceItem>): ServiceItem => ({
            id: item.id || crypto.randomUUID(),
            description: item.description || '',
            quantity: item.quantity ?? 1,
            price: item.price ?? 0,
        }));

        const subtotal = data.subtotal ?? items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const discount = data.discount ?? 0;
        const total = data.total ?? (subtotal - discount);

        const invoice: Invoice = {
            id: doc.id,
            clientName: data.clientName || '',
            issueDate: data.issueDate || new Date().toISOString(),
            dueDate: data.dueDate || new Date().toISOString(),
            items,
            subtotal,
            discount,
            total,
            status: data.status || InvoiceStatus.Unpaid,
            paidAmount: data.paidAmount ?? 0,
            gPayNumber: data.gPayNumber || '',
            shopName: data.shopName || '',
            createdAt: data.createdAt || Date.now(),
        };
        return invoice;
    });
};

export const getInvoice = async (id: string): Promise<Invoice | null> => {
    const docSnap = await invoicesCollection.doc(id).get();
    if (!docSnap.exists) {
        return null;
    }
    
    const data = docSnap.data() || {};

    const items: ServiceItem[] = (data.items || []).map((item: Partial<ServiceItem>): ServiceItem => ({
        id: item.id || crypto.randomUUID(),
        description: item.description || '',
        quantity: item.quantity ?? 1,
        price: item.price ?? 0,
    }));
    
    const subtotal = data.subtotal ?? items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const discount = data.discount ?? 0;
    const total = data.total ?? (subtotal - discount);

    const invoice: Invoice = {
        id: docSnap.id,
        clientName: data.clientName || '',
        issueDate: data.issueDate || new Date().toISOString(),
        dueDate: data.dueDate || new Date().toISOString(),
        items,
        subtotal,
        discount,
        total,
        status: data.status || InvoiceStatus.Unpaid,
        paidAmount: data.paidAmount ?? 0,
        gPayNumber: data.gPayNumber || '',
        shopName: data.shopName || '',
        createdAt: data.createdAt || Date.now(),
    };
    return invoice;
};

export const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<void> => {
    await invoicesCollection.doc(id).update(data);
};
