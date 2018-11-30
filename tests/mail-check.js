const url = require('url');

const unsub =
  '<mailto:abuse-4Du6_mFRfEblp1ohM7KYimXaZIBpNNNk5y6OUZGCGXQo@e.vayama.com>,https://e.vayama.com/2/4/1737/11/7ZItkOBcNQYsGMimJ1ibIMUDyAHYy8b8wFBYpjeMjpSikxZ1eLo7GSE_Z6bwA_5r';
let unsubscribeMailTo = null;
let unsubscribeLink = null;

if (/^<.+>,\s*<.+>$/.test(unsub)) {
  const unsubTypes = unsub.split(',').map(a => a.trim().match(/^<(.*)>$/)[1]);
  unsubscribeMailTo = unsubTypes.find(m => m.startsWith('mailto'));
  unsubscribeLink = unsubTypes.find(m => m.startsWith('http'));
} else if (/^<.+>,\s*.+$/.test(unsub)) {
  const unsubTypes = unsub.split(',').map(a => getValue(a));
  unsubscribeMailTo = unsubTypes.find(m => m.startsWith('mailto'));
  unsubscribeLink = unsubTypes.find(m => m.startsWith('http'));
} else if (unsub.startsWith('<http')) {
  unsubscribeLink = unsub.substr(1, unsub.length - 2);
} else if (unsub.startsWith('<mailto')) {
  unsubscribeMailTo = unsub.substr(1, unsub.length - 2);
} else if (url.parse(unsub).protocol === 'mailto') {
  unsubscribeMailTo = unsub;
} else if (url.parse(unsub).protocol !== null) {
  unsubscribeLink = unsub;
}
if (!unsubscribeMailTo && !unsubscribeLink) {
  return null;
}

// strip the <> if they exist
function getValue(str) {
  if (str.trim().match(/^<.+>$/)) {
    return str.substr(1, unsub.length - 2);
  }
  return str;
}
