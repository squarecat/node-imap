import Airtable from 'airtable';
import config from 'getconfig';
import logger from './logger';

const airtableKey = config.airtable.key;
const baseId = config.airtable.expensesBaseId;
const tableId = config.airtable.expensesTableId;

const base = new Airtable({
  apiKey: airtableKey
}).base(baseId);

export function getExpenses() {
  return new Promise((resolve, reject) => {
    base(tableId)
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
