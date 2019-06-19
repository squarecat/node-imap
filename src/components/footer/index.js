import './footer.module.scss';

import { MailIcon, TwitterIcon } from '../icons';

import React from 'react';
import { TextLink } from '../text';
import cx from 'classnames';

export default visProps => (
  <div
    styleName={cx('footer', {
      subpage: visProps.subpage
    })}
  >
    <ul styleName="footer-nav">
      <li>
        <TextLink href="/privacy">Privacy</TextLink>
      </li>
      <li>
        <TextLink href="/terms">Terms</TextLink>
      </li>
      <li>
        <TextLink href="/faq">FAQ</TextLink>
      </li>
      <li>
        <TextLink target="_" href="http://leavemealone.releasepage.co">
          Releases
        </TextLink>
      </li>
      <li>
        <TextLink target="_blank" rel="noopener noreferrer" href="/roadmap">
          Roadmap
        </TextLink>
      </li>
      <li>
        <TextLink target="_" href="https://blog.leavemealone.xyz">
          Blog
        </TextLink>
      </li>
    </ul>
    <ul styleName="footer-nav">
      <li>
        <TextLink target="_blank" rel="noopener noreferrer" href="/feedback">
          Give us feedback
        </TextLink>
      </li>
      <li>
        <TextLink target="_blank" rel="noopener noreferrer" href="/bugs">
          Report a bug
        </TextLink>
      </li>
      <li>
        <a href="javascript:window.Metomic.raise()">Manage cookies</a>
      </li>
    </ul>
    <ul styleName="footer-social">
      <li title="@LeaveMeAloneApp">
        <TextLink undecorated href="https://twitter.com/leavemealoneapp">
          <TwitterIcon />
        </TextLink>
      </li>
      <li title="leavemealone@squarecat.io">
        <TextLink undecorated href="mailto:leavemealone@squarecat.io">
          <MailIcon />
        </TextLink>
      </li>
    </ul>
  </div>
);
