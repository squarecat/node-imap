require('@babel/register');
require('@babel/polyfill');

const db = require('../../server/dao/db');
const OrgService = require('../../server/services/organisation');

async function run() {
  console.log('connecting...');
  await db.connect();
  console.log('connected...');
  await OrgService.createOrganisation('james@squarecat.io', {
    name: 'Squarecat',
    domain: 'squarecat.io',
    allowAnyUserWithCompanyEmail: false
  });
  console.log('success');
}

run();
