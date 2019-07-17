import './illustration.module.scss';

import {
  AirplaneIcon,
  DiscountIcon,
  SocialLikeIcon
} from './illustration-icons';
import React, { useCallback, useState } from 'react';

import Toggle from '../../toggle';

export default () => {
  const [state, setState] = useState({
    subscribed: true,
    loading: false
  });

  const onClickToggle = useCallback(
    () => {
      setState({
        subscribed: false,
        loading: true
      });
      setTimeout(() => {
        setState({ subscribed: false, loading: false });
      }, 2500);
      return true;
    },
    [state]
  );

  return (
    <div styleName="illustration">
      <div styleName="row">
        <div styleName="img">
          <SocialLikeIcon />
        </div>
        <span styleName="subject">Social Media Notifications</span>
        <div styleName="toggle">
          <Toggle status={false} />
        </div>
      </div>

      <div styleName="row">
        <div styleName="img">
          <AirplaneIcon />
        </div>
        <span styleName="subject">
          Cheap Travel Alerts
          {!state.subscribed && !state.loading ? "it's gone!" : null}
        </span>
        <div styleName="toggle">
          <Toggle
            status={state.subscribed}
            loading={state.loading}
            onChange={onClickToggle}
          />
        </div>
      </div>

      <div styleName="row">
        <div styleName="img">
          <DiscountIcon />
        </div>
        <span styleName="subject">Discount Sale Promotions</span>
        <div styleName="toggle">
          <Toggle status={false} />
        </div>
      </div>
    </div>
  );
};
