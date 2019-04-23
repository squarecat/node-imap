const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

export const PAYMENT_CONFIG_OPTS = {
  key: process.env.STRIPE_PK,
  image: logoUrl,
  locale: 'auto'
};

export const PAYMENT_CHECKOUT_OPTS = {
  name: 'Leave Me Alone',
  zipCode: true,
  billingAddress: true,
  currency: 'usd'
};
