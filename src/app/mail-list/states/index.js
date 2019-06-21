import './state.module.scss';

import React, { useCallback, useContext } from 'react';

import Button from '../../../components/btn';
import { MailContext } from '../provider';
import stateImg from '../../../assets/envelope-logo.png';

export const Empty = ({ hasFilters } = {}) => {
  const { dispatch } = useContext(MailContext);

  const clearFilters = useCallback(
    () =>
      dispatch({
        type: 'remove-active-filters'
      }),
    [dispatch]
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
        {hasFilters ? (
          <Button compact basic onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
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
