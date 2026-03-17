export interface InvoiceCalculationInput {
  price?: number;
  taxRate?: number;
  taxEnabled?: boolean;
}

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function calculateInvoiceTotals(
  input: InvoiceCalculationInput,
): InvoiceTotals {
  const price = input.price ?? 0;
  const taxRate = input.taxEnabled ? input.taxRate ?? 0 : 0;

  const subtotal = price;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return {
    subtotal,
    taxAmount,
    total,
  };
}

