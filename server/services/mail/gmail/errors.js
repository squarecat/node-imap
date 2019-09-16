import { MailError } from '../../../utils/errors';
import { invalidateAccounts } from '../../../dao/user';

export async function parseError(error, { userId, accountId }) {
  if (error && error.message === 'Mail service not enabled') {
    const problem = 'mail-service-not-enabled';
    await invalidateAccounts(userId, { provider: 'google', problem });

    return new MailError('mail service not enabled', {
      cause: error,
      errKey: 'mail-service-not-enabled',
      problem,
      accountId
    });
  }

  if (error && error.message === 'Account has been deleted') {
    const problem = 'account-deleted';
    await invalidateAccounts(userId, { provider: 'google', problem });

    return new MailError('account has been deleted', {
      cause: error,
      errKey: 'account-deleted',
      problem,
      accountId
    });
  }

  return new MailError('failed to fetch mail', {
    provider: 'gmail',
    cause: error
  });
}
