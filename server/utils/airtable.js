import Airtable from 'airtable';
import config from 'getconfig';
import isAfter from 'date-fns/is_after';
import logger from './logger';
import subHours from 'date-fns/sub_hours';

const airtableKey = config.airtable.key;
const { expenses, beta, news } = config.airtable;

const airtable = new Airtable({
  apiKey: airtableKey
});

const expensesBase = airtable.base(expenses.baseId);
const betaBase = airtable.base(beta.baseId);
const newsBase = airtable.base(news.baseId);

let newsItems = {
  results: [],
  lastFetched: null
};
let expensesItems = {
  results: [],
  lastFetched: null
};

export function getExpenses() {
  const oneHourAgo = subHours(new Date(), 1);
  if (
    expensesItems.lastFetched &&
    isAfter(expensesItems.lastFetched, oneHourAgo)
  ) {
    logger.debug('airtable: returning expenses from cache');
    return expensesItems.results;
  }

  logger.debug('airtable: fetching expenses');
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

export function getNews() {
  const oneHourAgo = subHours(new Date(), 1);
  if (newsItems.lastFetched && isAfter(newsItems.lastFetched, oneHourAgo)) {
    logger.debug('airtable: returning news from cache');
    return newsItems.results;
  }
  logger.debug('airtable: fetching news');

  return new Promise((resolve, reject) => {
    newsBase(news.tableId)
      .select({
        view: 'Grid view'
      })
      .firstPage((err, records) => {
        if (err) {
          logger.error('airtable: failed to get news stats');
          logger.error(err);
          return reject(err);
        }
        const news = records.reduce(
          (out, r) =>
            r.get('hidden')
              ? out
              : [
                  ...out,
                  {
                    name: r.get('Name'),
                    quote: r.get('Quote'),
                    shortQuote: r.get('Short Quote'),
                    url: r.get('Article URL'),
                    logoUrl: r.get('Logo URL'),
                    featured: r.get('Featured'),
                    simple: r.get('Listing')
                  }
                ],
          []
        );
        newsItems = {
          results: news,
          lastFetched: new Date()
        };
        return resolve(news);
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
