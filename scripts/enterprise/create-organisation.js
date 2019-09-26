require('@babel/register');
require('@babel/polyfill');

const db = require('../../server/dao/db');
const OrgService = require('../../server/services/organisation');

const email = process.argv[2];
const name = process.argv[3];
const domain = process.argv[4];

async function run() {
  if (!email || !name || !domain) {
    console.error('usage: create-organisation.js <email> <name> <domain>');
    process.exit(0);
  }
  console.log('creating organisation...');

  console.log('db connecting...');
  await db.connect();
  console.log('db connected...');

  const organisation = await OrgService.createOrganisation(email, {
    name,
    domain,
    allowAnyUserWithCompanyEmail: false,
    active: false
  });
  console.log('success!');

  console.log(`id: ${organisation.id}`);
  console.log(`invite code: ${organisation.inviteCode}`);

  console.log('done');
}

run();
