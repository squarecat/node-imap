require('@babel/register');
require('@babel/polyfill');

const db = require('../../server/dao/db');
const OrgService = require('../../server/services/organisation');

async function run() {
  console.log('connecting...');
  await db.connect();
  console.log('connected...');
  const adminEmail = 'danielle@squarecat.io';

  await OrgService.createOrganisation(adminEmail, {
    name: 'Squarecat',
    domain: 'squarecat.io',
    allowAnyUserWithCompanyEmail: false
    // active: true
  });

  console.log('success');
}

run();
