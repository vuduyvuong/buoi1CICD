export function calculatePricing(subtotal, promoCode) {
  const code = (promoCode || '').trim().toUpperCase();
  const baseShipping = subtotal === 0 || subtotal >= 1000000 ? 0 : 50000;
  let discount = 0;
  let shipping = baseShipping;
  let message = '';
  if (code === 'BANSAC10') {
    discount = Math.round(subtotal * 0.1);
    message = 'Đã giảm 10% giá trị sản phẩm.';
  } else if (code === 'FREESHIP') {
    shipping = 0;
    message = 'Đã áp dụng miễn phí vận chuyển.';
  } else if (code) {
    message = 'Mã ưu đãi chưa hợp lệ hoặc đã hết hạn.';
  }
  return { code: discount || shipping !== baseShipping ? code : '', discount, shipping, total: Math.max(0, subtotal - discount + shipping), message, valid: !code || Boolean(discount || shipping !== baseShipping) };
}
