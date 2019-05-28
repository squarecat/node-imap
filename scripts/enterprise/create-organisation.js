const { createOrganisation } = require('../../server/services/organisation');

const ownerEmail = 'danielle@squarecat.io';

// update this with the company details
const orgData = {
  name: 'Squarecat',
  domain: 'squarecat.io',
  allowAnyUserWithCompanyEmail: false
};

try {
  createOrganisation(ownerEmail, orgData);
} catch (err) {
  console.log(err);
}
