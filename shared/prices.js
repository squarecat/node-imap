/**
 * No ES6 please
 */

const PACKAGE_DATA = [
  { id: '1', credits: 50, discount: 0 },
  { id: '2', credits: 100, discount: 0.1 },
  { id: '3', credits: 200, discount: 0.2 },
  { id: '4', credits: 300, discount: 0.3 }
];

const PACKAGE_BASE_PRICE = 5;

module.exports.USAGE_BASED = {
  price: 10
};

module.exports.PACKAGES = PACKAGE_DATA.map(p => ({
  ...p,
  price: (PACKAGE_BASE_PRICE - PACKAGE_BASE_PRICE * p.discount) * p.credits
}));

module.exports.getPackage = function(id) {
  return module.exports.PACKAGES.find(p => p.id === id);
};

module.exports.ENTERPRISE = {
  pricePerSeat: 400
};
