import { getBetaUser } from '../utils/airtable';
import { getByInvitedEmailOrValidDomain } from '../dao/organisation';
import getReferrer from '../utils/referer-parser';
import logger from '../utils/logger';

const REMEMBER_ME_FOR = 365 * 24 * 60; // 1 year

export async function isBetaUser({ email }) {
  try {
    // if the user is invited to an organisation then bypass the beta chech
    const organisation = await getByInvitedEmailOrValidDomain(email);
    if (organisation) return true;

    // otherwise check if they're beta
    const user = await getBetaUser({ email });
    if (user) return true;

    // otherwise they're not allowed
    logger.debug('access: user is not in beta');
    return false;
  } catch (err) {
    logger.error('access: failed to determine if user is allowed');
    logger.error(err);
    throw err;
  }
}

export async function setRememberMeCookie(res, { username, provider }) {
  res.cookie('remember-me-username', username, { maxAge: REMEMBER_ME_FOR });
  res.cookie('remember-me-provider', provider, { maxAge: REMEMBER_ME_FOR });
}

export function getReferrerUrlData(req) {
  const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const referrer = req.header('Referrer');

  const r = getReferrer(referrer, currentUrl);
  if (r.known && r.medium !== 'internal') {
    return {
      referer: r.referer,
      params: r.search_parameter,
      medium: r.medium,
      term: r.search_term,
      uri: r.uri
    };
  }
  return null;
}
