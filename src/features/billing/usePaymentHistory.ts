import { useState } from 'react';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
}

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2026-003', date: '2026-07-01', amount: '$29.00', status: 'Paid' },
  { id: 'INV-2026-002', date: '2026-06-01', amount: '$29.00', status: 'Paid' },
  { id: 'INV-2026-001', date: '2026-05-01', amount: '$29.00', status: 'Paid' },
];

export const usePaymentHistory = () => {
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);

  return { invoices };
};
