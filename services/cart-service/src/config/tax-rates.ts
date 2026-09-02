export const TAX_RATES: Record<string, number> = {
  GST_0: 0,
  GST_5: 0.05,
  GST_12: 0.12,
  GST_18: 0.18,
  GST_28: 0.28,
};

export function getTaxRate(taxClass: string): number {
  return TAX_RATES[taxClass] || 0;
}
