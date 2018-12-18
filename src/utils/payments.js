import logo from '../assets/envelope-logo.png';

export const PAYMENT_CONFIG_OPTS = {
  key: `${process.env.STRIPE_PK}`,
  image: logo,
  locale: 'auto'
};

export const PAYMENT_CHECKOUT_OPTS = {
  name: 'Leave Me Alone',
  zipCode: true,
  billingAddress: true,
  currency: 'usd'
};
