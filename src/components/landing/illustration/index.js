import './illustration.module.scss';

import {
  AirplaneIcon,
  DiscountIcon,
  SocialLikeIcon
} from './illustration-icons';
import React, { useCallback, useState } from 'react';

import SenderImage from '../senders/sender-image';
import { TextImportant } from '../../text';
import Toggle from '../../toggle';
import amazonImg from '../../../assets/sender-logos/amazon.png';
import facebookImg from '../../../assets/sender-logos/facebook.png';
import twitterImg from '../../../assets/sender-logos/twitter.png';
import walmartImg from '../../../assets/sender-logos/walmart.png';

export default ({ sender = null }) => {
  const [state, setState] = useState({
    subscribed: true,
    loading: false
  });

  const onClickToggle = useCallback(() => {
    setState({
      subscribed: false,
      loading: true
    });
    setTimeout(() => {
      setState({ subscribed: false, loading: false });
    }, 1500);
    return true;
  }, []);

  return (
    <div styleName="wrapper">
      <div styleName="illustration">
        <div styleName="row">
          {sender ? (
            getSocialImg(sender.name)
          ) : (
            <div styleName="svg">
              <SocialLikeIcon />
            </div>
          )}

          <span styleName="subject">Social Media Notifications</span>
          <div styleName="toggle">
            <Toggle status={false} />
          </div>
        </div>

        <div styleName="row">
          {sender ? (
            getSenderContent(sender)
          ) : (
            <>
              <div styleName="svg">
                <AirplaneIcon />
              </div>
              <span styleName="subject">Cheap Travel Alerts</span>
            </>
          )}

          <div styleName="toggle">
            <Toggle
              status={state.subscribed}
              loading={state.loading}
              onChange={onClickToggle}
            />
          </div>
        </div>

        <div styleName="row">
          {sender ? (
            getDiscountImg(sender.name)
          ) : (
            <div styleName="svg">
              <DiscountIcon />
            </div>
          )}

          <span styleName="subject">Discount Sale Promotions</span>
          <div styleName="toggle">
            <Toggle status={false} />
          </div>
        </div>
      </div>
      <span
        styleName={`gone ${!state.subscribed && !state.loading ? 'shown' : ''}`}
      >
        Unsubscribed! It's <TextImportant>that</TextImportant> easy.
      </span>
    </div>
  );
};

function getSocialImg(senderName) {
  let img = facebookImg;
  let alt = 'Facebook logo';
  if (senderName === 'facebook' || senderName === 'amazon') {
    img = twitterImg;
    alt = 'Twitter logo';
  }
  return <img styleName="img" src={img} alt={alt} />;
}
function getDiscountImg(senderName) {
  let img = amazonImg;
  let alt = 'Amazon logo';
  if (senderName === 'facebook' || senderName === 'amazon') {
    img = walmartImg;
    alt = 'Walmart logo';
  }
  return <img styleName="img" src={img} alt={alt} />;
}
function getSenderContent({ label, domain }) {
  return (
    <>
      <div styleName="sender-img">
        <SenderImage name={label} domain={domain} />
      </div>
      <span styleName="subject">{label} Emails</span>
    </>
  );
}
