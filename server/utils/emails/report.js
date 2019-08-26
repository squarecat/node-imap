import escape from 'escape-html';
import logger from '../logger';
import { mailgun } from 'getconfig';
import relative from 'tiny-relative-date';
import { sendTransactionalMail } from './transactional';

export function sendReportEmail(user, mailData) {
  logger.info('email-utils: sending report mail');
  const { id, email, billing, createdAt } = user;
  const { credits, creditsUsed } = billing;

  const {
    unsubscribeId,
    from,
    imageUrl,
    unsubscribeStrategy,
    occurrences,
    lastReceived,
    unsubscribedAt,
    estimatedSuccess,
    hasImage
  } = mailData;

  let text = `
Mail
====
Unsub ID:\t ${unsubscribeId}
From:\t ${from}
Unsub Strategy:\t ${unsubscribeStrategy}
Occurrences:\t ${occurrences}
Last Received:\t ${relative(lastReceived)}
Unsubscribed At:\t ${relative(unsubscribedAt)}
Estimation:\t ${estimatedSuccess}
Image:\t ${imageUrl}

User
====
User ID:\t ${id}
Email:\t ${email}
Credits:\t ${credits}
Used credits:\t ${creditsUsed || 0}
User since:\t ${relative(createdAt)}
`;
  const html = `A user has reported a mailing list;

<table>
<tr><td><b>Mail Data</b></td><td></td></tr>
<tr><td>Unsub ID</td><td>${unsubscribeId}</td></tr>
<tr><td>From</td><td>${escape(from)}</td>
<tr><td>Unsub Strategy</td><td>${unsubscribeStrategy}</td>
<tr><td>Occurrences</td><td>${occurrences}</td>
<tr><td>Last Received</td><td>${relative(lastReceived)}</td>
<tr><td>Unsubscribed At</td><td>${relative(unsubscribedAt)}</td>
<tr><td>Estimation</td><td>${estimatedSuccess}</td>
<tr><td>Image</td><td>${imageUrl}</td>

<tr><td><b>User Data</b></td><td></td></tr>
<tr><td>User ID</td><td>${id}</td></tr>
<tr><td>Email</td><td>${email}</td></tr>
<tr><td>Credits</td><td>${credits}</td></tr>
<tr><td>Used credits</td><td>${creditsUsed || 0}</td></tr>
<tr><td>User since</td><td>${relative(createdAt)}</td></tr>
</table>`;

  let opts = {
    from: `Leave Me Alone <noreply@${mailgun.domains.transactional}>`,
    subject: `User reported mailing list ${from}`,
    to: 'hi@leavemealone.app',
    text,
    html
  };
  if (hasImage) {
    opts = {
      ...opts,
      attachment: imageUrl
    };
  }
  return sendTransactionalMail(opts);
}
