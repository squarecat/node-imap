import { ConnectImapError } from '../../../utils/errors';

export function parseError(error) {
  const { source, code, message } = error;

  // only show the user the raw message if the source is the provider
  // source can be so far
  // authentication: comes from the provider e.g. invalid credentials
  // socket: comes from the socket e.g. getaddrinfo ENOTFOUND host:port
  if (source === 'authentication') {
    return new ConnectImapError(message, {
      cause: error,
      errKey: {
        type: 'imap-auth-error',
        message
      }
    });
  }

  if (source === 'socket' && code === 'ENOTFOUND') {
    const { host, port } = error;
    return new ConnectImapError(message, {
      cause: error,
      errKey: {
        type: 'imap-connect-error',
        message: `Mail server not found ${host}:${port}`
      }
    });
  }

  // otherwise it's a generic error
  return new ConnectImapError('failed to authenticate with IMAP server', {
    cause: error,
    errKey: {
      type: 'imap-error'
    }
  });
}
