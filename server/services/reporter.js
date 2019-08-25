import { imageStoragePath } from 'getconfig';
import logger from '../../build/utils/logger';
import { reportUnsub } from '../dao/user';
import { sendReportEmail } from '../utils/emails/report';

export async function report(user, mailData) {
  const { unsubscribeId, id: mailId } = mailData;
  const { id: userId } = user;
  try {
    const imageUrl = `${imageStoragePath}/${userId}/${mailId}.png`;
    await sendReportEmail(user, { ...mailData, imageUrl });
    await reportUnsub(userId, unsubscribeId);
    return true;
  } catch (err) {
    logger.error('reporter: failed to report email');
    logger.error(err);
    throw err;
  }
}
