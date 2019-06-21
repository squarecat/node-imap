export const USAGE_BASED = {
  price: 10
};

const PACKAGE_DATA = [
  { id: '1', credits: 50, discount: 0 },
  { id: '2', credits: 100, discount: 0.1 },
  { id: '3', credits: 200, discount: 0.2 },
  { id: '4', credits: 300, discount: 0.3 }
];

const PACKAGE_BASE_PRICE = 5;

export const PACKAGES = PACKAGE_DATA.map(p => ({
  ...p,
  price: (PACKAGE_BASE_PRICE - PACKAGE_BASE_PRICE * p.discount) * p.credits
}));

export function getPackage(id) {
  return PACKAGES.find(p => p.id === id);
}

export const ENTERPRISE = {
  pricePerSeat: 400
};
