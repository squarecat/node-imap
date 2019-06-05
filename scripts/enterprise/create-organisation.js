require('@babel/register');
require('@babel/polyfill');

const db = require('../../server/dao/db');
const OrgDao = require('../../server/services/organisation');

async function run() {
  console.log('connecting...');
  await db.connect();
  console.log('connected...');
  await OrgDao.createOrganisation('danielle@squarecat.io', {
    name: 'Squarecat',
    domain: 'squarecat.io',
    allowAnyUserWithCompanyEmail: false
  });
  console.log('success');
}

run();
