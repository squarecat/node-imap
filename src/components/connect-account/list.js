import { GoogleIcon, OutlookIcon } from '../icons';
import React, { useEffect, useState } from 'react';

import Button from '../btn';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import cx from 'classnames';
import styles from './connect.module.scss';

export default ({
  primaryEmail = '',
  loginProvider = 'password',
  accounts = [],
  onClickRemove = () => {}
}) => {
  const [removingAccounts, setRemovingAccounts] = useState({});
  const onClickRemoveAccount = async email => {
    setRemovingAccounts({ ...removingAccounts, [email]: true });
    await onClickRemove(email);
    setRemovingAccounts({ ...removingAccounts, [email]: false });
  };
  useEffect(() => {});
  return (
    <ul styleName="account-list">
      {accounts.map(account => {
        const { email, provider, id } = account;
        const isPrimary =
          loginProvider !== 'password' && primaryEmail === email;
        return (
          <Transition
            appear
            timeout={200}
            mountOnEnter
            unmountOnExit
            in={true}
            key={id}
          >
            {state => {
              const s = _capitalize(state);
              const hasStyle = !!styles[`account${s}`];
              const classes = cx(styles['account'], {
                [styles[`account${s}`]]: hasStyle
              });
              return (
                <li className={classes}>
                  {getIcon(provider)}
                  <span>
                    {email} {isPrimary ? '(primary)' : ''}
                  </span>
                  {isPrimary ? null : (
                    <Button
                      compact
                      muted
                      basic
                      onClick={() => onClickRemoveAccount(email)}
                      loading={removingAccounts[email]}
                    >
                      <span styleName="desktop">Remove</span>
                      <span styleName="mobile">x</span>
                    </Button>
                  )}
                </li>
              );
            }}
          </Transition>
        );
      })}
    </ul>
  );
};

function getIcon(provider) {
  if (provider === 'google') return <GoogleIcon width="16" height="16" />;
  if (provider === 'outlook') return <OutlookIcon width="16" height="16" />;
}
