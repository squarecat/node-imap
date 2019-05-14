import { MailContext, MailProvider } from './db';
import React, { useContext } from 'react';

import Button from '../../../components/btn';

export default () => {
  return (
    <MailProvider>
      <MailList />
    </MailProvider>
  );
};

function MailList() {
  const { mail, refresh } = useContext(MailContext);
  console.log(mail);
  return <Button onClick={refresh}>Refresh</Button>;
}
