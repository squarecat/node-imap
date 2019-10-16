import _groupBy from 'lodash.groupby';
import { hash } from '../encryption';
import { parseEmail } from '../../utils/parsers';

export function parseSenderEmail(email) {
  const { fromEmail, fromName } = parseEmail(email);
  let senderAddress = fromEmail.trim();
  if (senderAddress.startsWith('<')) {
    senderAddress = senderAddress.substr(1, senderAddress.length);
  }
  if (senderAddress.endsWith('>')) {
    senderAddress = senderAddress.substr(0, senderAddress.length - 1);
  }
  return {
    senderAddress: senderAddress.toLowerCase(),
    friendlyName: fromName.trim()
  };
}

export async function partitionOccurrences({ occurrences, col }) {
  const hashedSenders = occurrences.map(oc => hash(oc.domain));
  const existing = await col
    .find({
      hashedSender: {
        $in: hashedSenders
      }
    })
    .toArray();
  let existingOccurences = occurrences.filter(oc => {
    return existing.some(eo => eo.hashedSender === hash(oc.domain));
  });
  let newOccurrences = occurrences.filter(oc => {
    return existing.every(eo => eo.hashedSender !== hash(oc.domain));
  });
  const grouped = _groupBy(newOccurrences, 'domain');

  newOccurrences = newOccurrences.reduce((out, oc) => {
    const { senderAddress, domain } = oc;
    const dupes = grouped[domain];
    // is this a duplicate where all that's
    // different is the sender name? If so then
    // merge it with the one we've already seen
    if (dupes.indexOf(oc) > 0 && senderAddress === dupes[0].senderAddress) {
      return out.map(o => {
        if (o.domain === domain && o.senderAddress === senderAddress) {
          return {
            ...o,
            occurrences: o.occurrences + oc.occurrences
          };
        }
        return o;
      });
    }
    // if there is the second known address for this domain in this
    // groud then remove it from this array and add it to existing array
    // as it will be appended to the new one in the next operation
    if (dupes.findIndex(d => d.senderAddress === senderAddress) > 0) {
      existingOccurences = [...existingOccurences, oc];
      return out;
    }
    return [...out, oc];
  }, []);
  return { existingOccurences, newOccurrences };
}

export function parseDomain(senderAddress) {
  let domain = senderAddress.split('@')[1];
  if (domain.endsWith('>')) {
    domain = domain.substr(0, domain.length - 1);
  }
  return domain;
}
