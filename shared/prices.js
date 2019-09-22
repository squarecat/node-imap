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

module.exports.getRecommendation = function(num) {
  return module.exports.PACKAGES.find(p => num <= p.credits);
};

module.exports.ENTERPRISE = {
  basePrice: 600,
  pricePerSeat: 600
};

module.exports.getTeamsPaymentAmounts = function(
  seats = 0,
  discountPercentOff
) {
  const initialBasePrice = module.exports.ENTERPRISE.basePrice;
  const initialPlanPrice = module.exports.ENTERPRISE.pricePerSeat;

  const initialPaymentAmount = initialBasePrice + initialPlanPrice * seats;

  let totalAmount = initialPaymentAmount;
  let basePrice = initialBasePrice;
  let planPrice = initialPlanPrice;
  let discountAmount = 0;

  if (discountPercentOff) {
    totalAmount = totalAmount - totalAmount * (discountPercentOff / 100);
    basePrice = basePrice - basePrice * (discountPercentOff / 100);
    planPrice = planPrice - planPrice * (discountPercentOff / 100);
    discountAmount = initialPaymentAmount * (discountPercentOff / 100);
  }

  return {
    totalAmount,
    planPrice,
    basePrice,
    initialPlanPrice,
    initialBasePrice,
    discountAmount
  };
};

module.exports.getViewPrice = function(priceInCents) {
  const priceInDollars = priceInCents / 100;
  if (priceInDollars % 1 === 0) {
    return priceInDollars;
  }
  return priceInDollars.toFixed(2);
};
