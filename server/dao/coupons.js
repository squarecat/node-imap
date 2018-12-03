import db from './db';

const COL_NAME = 'coupons';

export async function getDiscount(couponName) {
  try {
    const col = await db().collection(COL_NAME);
    const coupon = await col.findOne({
      name: couponName
    });
    if (!coupon) return 1;
    const { expires, quantityRemaining, discountPercentage } = coupon;
    const isExpired = expires !== 'never' && expires < Date.now();
    const noneLeft = quantityRemaining === 0;
    if (isExpired || noneLeft) {
      return 1;
    }
    return discountPercentage;
  } catch (err) {
    console.error('users-dao: error inserting unresolved unsubsription');
    console.error(err);
    throw err;
  }
}
