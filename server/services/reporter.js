import { imageStoragePath } from 'getconfig';
import logger from '../../build/utils/logger';
import { parseEmail } from '../utils/parsers';
import { reportUnsub } from '../dao/user';
import { sendReportEmail } from '../utils/emails/report';
import { setSenderAsDelinquent } from './occurrences';

export async function report(user, mailData) {
  const { unsubscribeId, id: mailId } = mailData;
  const { id: userId } = user;
  try {
    const imageUrl = `${imageStoragePath}/${userId}/${mailId}.png`;
    // send the email to admins about the report
    await sendReportEmail(user, { ...mailData, imageUrl });
    // set the unsubscription as reported in the user collection
    await reportUnsub(userId, unsubscribeId);
    // set the sender as delinquent in the occurrences dao
    const { fromEmail: sender } = parseEmail(mailData.from);
    await setSenderAsDelinquent({ email: sender });
    return true;
  } catch (err) {
    logger.error('reporter: failed to report email');
    logger.error(err);
    throw err;
  }
}
