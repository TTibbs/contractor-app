export interface TaxSummary {
  income: number;
  expenses: number;
  profit: number;
  taxRate: number;
  estimatedTax: number;
  taxPaid: number;
  remainingTax: number;
}

export interface TaxPayment {
  id: string;
  amount: number;
  note: string | null;
  paidAt: string;
}

export interface ExpenseRow {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
  jobId: string | null;
  jobTitle: string | null;
  receiptCount: number;
}

