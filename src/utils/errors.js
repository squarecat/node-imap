export function getConnectError(reason) {
  switch (reason) {
    case 'not-invited':
      return 'Cannot connect account because it is not invited to your organisation.';
    case 'existing-member':
      return 'Cannot connect account because it is already in use in your organisation.';
    case 'invalid-domain':
      return 'Cannot connect account because it does not belong to your organisation domain.';
    default:
      return 'Something went wrong connecting your account. Please try again or send us a message.';
  }
}
