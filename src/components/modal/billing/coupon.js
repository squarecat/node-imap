import './coupon.module.scss';

import { FormGroup, FormInput, FormLabel } from '../../form';
import React, { useContext, useState } from 'react';

import { BillingModalContext } from './index';
import Button from '../../btn';
import cx from 'classnames';
import request from '../../../utils/request';

export default function CouponInput() {
  const { state, dispatch } = useContext(BillingModalContext);

  // const [isCouponShown, showCoupon] = useState(false);
  const [fetchingCoupon, setFetchingCoupon] = useState(false);
  const [couponData, setCouponData] = useState({
    code: '',
    percent_off: 0,
    amount_off: 0,
    valid: null
  });

  const applyCoupon = async coupon => {
    try {
      setFetchingCoupon(true);
      const { percent_off = 0, amount_off = 0 } = await getCoupon(coupon);
      if (percent_off || amount_off) {
        setCouponData({ ...couponData, percent_off, amount_off, valid: true });
        dispatch({
          type: 'set-coupon',
          data: coupon
        });
        const discount = getDiscountAmount(state.selectedPackage.price, {
          percent_off,
          amount_off
        });
        dispatch({
          type: 'set-package-discount-amount',
          data: discount
        });
      } else {
        setCouponData({ ...couponData, percent_off, amount_off, valid: false });
        dispatch({
          type: 'set-coupon',
          data: null
        });
        dispatch({
          type: 'set-package-discount-amount',
          data: 0
        });
      }
      setFetchingCoupon(false);
    } catch (err) {
      setCouponData({ coupon: null });
      setFetchingCoupon(false);
    }
  };

  return (
    <form
      styleName="coupon-form"
      id="coupon-form"
      onSubmit={e => {
        e.preventDefault();
        return applyCoupon(couponData.code);
      }}
    >
      <FormGroup>
        <FormLabel htmlFor="coupon">Have a discount coupon?</FormLabel>
        <div styleName="coupon">
          <div
            styleName={cx('coupon-input', {
              valid: couponData.valid === true,
              invalid: couponData.valid === false
            })}
          >
            <FormInput
              smaller
              disabled={fetchingCoupon}
              placeholder="Enter discount coupon"
              value={couponData.code}
              name="coupon"
              onChange={e => {
                setCouponData({ ...couponData, code: e.currentTarget.value });
              }}
            />
          </div>
          <span styleName="coupon-btn">
            <Button
              compact
              basic
              fill
              type="submit"
              as="button"
              disabled={!couponData.code}
              loading={fetchingCoupon}
            >
              Apply
            </Button>
          </span>
        </div>
      </FormGroup>
    </form>
  );
}

function getDiscountAmount(price, { percent_off, amount_off } = {}) {
  let discount = 0;
  if (percent_off) {
    discount = price * (percent_off / 100);
    // price = amount - amount * (percent_off / 100);
  } else if (amount_off) {
    discount = amount_off;
  }
  const discountedPrice = price - discount;
  // cannot charge less than 50 cents in Stripe so make the discount 100%
  return discountedPrice < 50 ? price : discount;
}

function getCoupon(coupon) {
  return request(`/api/payments/coupon/${coupon}`);
}
