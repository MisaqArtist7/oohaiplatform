// TEMPORARY: backend pricing formula unknown
/**
 * محاسبه برآورد مبلغ موقت به ریال
 * فرمول: قیمت ماهانه × (تعداد روزهای بازه ÷ ۳۰)
 * توجه: تخفیف، مالیات و هرگونه محاسبه ساختگی حذف شده است.
 */
export function estimateTotalRial(
  priceRial: number,
  startIso: string,
  endIso: string
): number {
  if (!startIso || !endIso || priceRial <= 0) return 0;

  const start = new Date(startIso);
  const end = new Date(endIso);

  const diffTime = end.getTime() - start.getTime();
  if (isNaN(diffTime) || diffTime <= 0) return 0;

  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 0;

  return Math.round(priceRial * (diffDays / 30));
}
