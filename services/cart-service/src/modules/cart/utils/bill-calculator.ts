export interface CartItem {
  cart_item_id: string;
  sku: string;
  name: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  weight?: number;
  line_total: number;
  tax_rate: number;
  tax_amount: number;
  requires_assisted_verification: boolean;
}

export interface BillSummary {
  subtotal: number;
  tax_total: number;
  discount: number;
  grand_total: number;
  item_count: number;
}

export interface AppliedPromo {
  promo_code: string;
  discount_amount: number;
}

export function calculateBill(items: CartItem[], appliedPromo?: AppliedPromo): { items: CartItem[], bill_summary: BillSummary } {
  let subtotal = 0;
  let tax_total = 0;
  let item_count = 0;

  for (const item of items) {
    subtotal += item.line_total;
    tax_total += item.tax_amount;
    item_count += item.quantity;
  }

  const discount = appliedPromo ? appliedPromo.discount_amount : 0;

  return {
    items,
    bill_summary: {
      subtotal: Number(subtotal.toFixed(2)),
      tax_total: Number(tax_total.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      grand_total: Number(Math.max(0, subtotal + tax_total - discount).toFixed(2)),
      item_count,
    }
  };
}
