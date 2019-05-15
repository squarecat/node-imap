import {
  MailContext,
  MailItemContext,
  MailItemProvider,
  MailProvider
} from './db';
import React, { useContext } from 'react';

import Button from '../../../components/btn';
import Item from './item';

export default () => {
  return (
    <MailProvider>
      <MailList />
    </MailProvider>
  );
};

function MailList() {
  const { mail, refresh } = useContext(MailContext);
  return (
    <div>
      <Button onClick={refresh}>Refresh</Button>
      <ul>
        {mail.map(({ id }) => {
          return (
            <li key={id}>
              <MailItemProvider id={id}>
                <MailItem />
              </MailItemProvider>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
function MailItem() {
  const mailItem = useContext(MailItemContext);
  console.log('item', mailItem);
  return <Item mail={mailItem} />;
}
