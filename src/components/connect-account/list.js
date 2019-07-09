import { GoogleIcon, OutlookIcon } from '../icons';
import React, { useCallback, useState } from 'react';

import Button from '../btn';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import cx from 'classnames';
import styles from './connect.module.scss';

const ConnectList = ({
  primaryEmail = '',
  loginProvider = 'password',
  accounts = [],
  onClickRemove,
  showPrimary = true
}) => {
  const [removingAccounts, setRemovingAccounts] = useState({});

  const onClickRemoveAccount = useCallback(async email => {
    try {
      setRemovingAccounts({ ...removingAccounts, [email]: true });
      await onClickRemove(email);
    } catch (err) {
      // error is handled with an alert higher up
    } finally {
      setRemovingAccounts({ ...removingAccounts, [email]: false });
    }
  }, []);

  return (
    <ul styleName="account-list">
      {accounts.map(account => (
        <Account
          key={account.email}
          account={account}
          isPrimary={
            loginProvider !== 'password' && primaryEmail === account.email
          }
          showPrimary={showPrimary}
          loading={removingAccounts[account.email]}
          onClickRemoveAccount={onClickRemoveAccount}
        />
      ))}
    </ul>
  );
};

function Account({
  account,
  isPrimary,
  showPrimary,
  loading,
  onClickRemoveAccount
}) {
  const { email, provider, id } = account;

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
              {email} {showPrimary && isPrimary ? '(primary)' : ''}
            </span>
            {isPrimary ? null : (
              <Button
                compact
                muted
                basic
                onClick={() => onClickRemoveAccount(email)}
                loading={loading}
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
}

function getIcon(provider) {
  if (provider === 'google') return <GoogleIcon width="16" height="16" />;
  if (provider === 'outlook') return <OutlookIcon width="16" height="16" />;
}

export default ConnectList;
