import './state.module.scss';

import React, { useCallback, useContext, useMemo } from 'react';

import Button from '../../../components/btn';
import { MailContext } from '../provider';
import stateImg from '../../../assets/logo.png';
import useUser from '../../../utils/hooks/use-user';

export const Empty = ({ hasFilters } = {}) => {
  const { dispatch } = useContext(MailContext);
  const [accounts] = useUser(u => u.accounts);
  const clearFilters = useCallback(
    () =>
      dispatch({
        type: 'remove-active-filters'
      }),
    [dispatch]
  );
  const buttons = useMemo(
    () => {
      if (hasFilters) {
        return (
          <Button key="" compact basic onClick={clearFilters}>
            Clear filters
          </Button>
        );
      } else if (!accounts.length) {
        return (
          <Button
            compact
            basic
            onClick={() => navigator('/app/profile/accounts')}
          >
            Connect an account
          </Button>
        );
      }
    },
    [accounts, clearFilters, hasFilters]
  );
  return (
    <div styleName="state-wrapper">
      <div styleName="state">
        <img styleName="state-img" src={stateImg} alt="empty list image" />
        <div styleName="state-text">
          No subscriptions here!{' '}
          <span role="img" aria-label="Tada">
            🎉
          </span>
        </div>
        {buttons}
      </div>
    </div>
  );
};

export const Loading = () => (
  <div styleName="state-wrapper">
    <div styleName="state">
      <img styleName="state-img" src={stateImg} alt="loading image" />
      <div styleName="state-text">Loading subscriptions...</div>
    </div>
  </div>
);
