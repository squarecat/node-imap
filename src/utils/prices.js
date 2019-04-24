export const PRICES = [
  {
    price: 800,
    label: '100 unsubscribes',
    value: '100'
  },
  {
    price: 500,
    label: '1 month',
    value: '1m'
  },
  {
    price: 800,
    label: '6 months',
    value: '6m'
  }
];

// export const PLANS = [
//   {
//     type: 'usage-based',
//     label: 'Usage Based',
//     data: {
//       price: '0.10',
//       note: 'per unsubscribe'
//     }
//   },
//   {
//     type: 'package',
//     label: 'Packages',
//     data: PACKAGES
//   },
//   {
//     type: 'enterprise',
//     label: 'Enterprise',
//     data: [{}]
//   }
// ];

export const USAGE_BASED = {
  price: 0.1
};

const PACKAGE_DATA = [
  { id: '1', unsubscribes: 50, discount: 0.1 },
  { id: '2', unsubscribes: 100, discount: 0.15 },
  { id: '3', unsubscribes: 200, discount: 0.2 },
  { id: '4', unsubscribes: 300, discount: 0.4 }
];

const PACKAGE_BASE_PRICE = 10;

export const PACKAGES = PACKAGE_DATA.map(p => ({
  ...p,
  price: (PACKAGE_BASE_PRICE - PACKAGE_BASE_PRICE * p.discount) * p.unsubscribes
}));

export const ENTERPRISE = {
  seats: 10,
  price: 80
};
