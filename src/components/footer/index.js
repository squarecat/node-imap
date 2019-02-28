import './footer.module.scss';
import cx from 'classnames';
import { MailIcon, TwitterIcon } from '../icons';

import React from 'react';
import { TextLink } from '../text';

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
        <TextLink
          target="_blank"
          rel="noopener noreferrer"
          href="http://leavemealone.releasepage.co"
        >
          Releases
        </TextLink>
      </li>
      <li>
        <TextLink target="_blank" rel="noopener noreferrer" href="/roadmap">
          Roadmap
        </TextLink>
      </li>
      <li>
        <TextLink
          target="_blank"
          rel="noopener noreferrer"
          href="https://blog.squarecat.io"
        >
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
        <TextLink href="/gifts">Purchase gift scan</TextLink>
      </li>
    </ul>
    <ul styleName="footer-social">
      <li title="@LeaveMeAloneApp">
        <a href="https://twitter.com/leavemealoneapp">
          <TwitterIcon />
        </a>
      </li>
      <li title="leavemealone@squarecat.io">
        <a href="mailto:leavemealone@squarecat.io">
          <MailIcon />
        </a>
      </li>
    </ul>
  </div>
);
