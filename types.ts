export enum InvoiceStatus {
  Paid = 'Paid',
  Unpaid = 'Unpaid',
  PartiallyPaid = 'Partially Paid'
}

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string; // Firestore document ID
  clientName: string;
  issueDate: string; // ISO string format
  dueDate: string;   // ISO string format
  items: ServiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  paidAmount: number;
  gPayNumber: string;
  shopName: string;
  createdAt: number; // timestamp
}
