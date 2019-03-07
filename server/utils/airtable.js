import Airtable from 'airtable';
import config from 'getconfig';
import logger from './logger';

const airtableKey = config.airtable.key;
const { expenses, beta } = config.airtable;

const airtable = new Airtable({
  apiKey: airtableKey
});

const expensesBase = airtable.base(expenses.baseId);
const betaBase = airtable.base(beta.baseId);

export function getExpenses() {
  return new Promise((resolve, reject) => {
    expensesBase(expenses.tableId)
      .select({
        view: 'Grid view'
      })
      .firstPage((err, records) => {
        if (err) {
          logger.error('airtable: failed to get expenses stats');
          logger.error(err);
          return reject(err);
        }
        const expenses = records.map(r => ({
          type: r.get('Type'),
          service: r.get('Service'),
          cost: r.get('Monthly Cost'),
          url: r.get('URL')
        }));
        return resolve(expenses);
      });
  });
}

export function getBetaUser({ email }) {
  logger.debug('airtable: trying to find user by email', email);
  return new Promise((resolve, reject) => {
    betaBase(beta.tableId)
      .select({
        filterByFormula: `({Email}='${email}')`
      })
      .firstPage((err, records) => {
        if (err) {
          logger.error('airtable: failed to get expenses stats');
          logger.error(err);
          return reject(err);
        }
        if (!records.length) {
          logger.debug('airtable: user not found');
          return resolve(null);
        }
        logger.debug('airtable: user found, resolving');
        return resolve({ email });
      });
  });
}
