import { MailIcon, TwitterIcon } from '../icons';

import React from 'react';
import { TextLink } from '../text';
import cx from 'classnames';
import styles from './footer.module.scss';

export default visProps => (
  <div
    className={cx(styles.footer, {
      [styles.subpage]: visProps.subpage
    })}
  >
    <ul styleName="footer-nav">
      <li>
        <TextLink href="/about">About us</TextLink>
      </li>
      <li>
        <TextLink href="/pricing">Pricing</TextLink>
      </li>
      <li>
        <TextLink href="/learn">How it works</TextLink>
      </li>
      <li>
        <TextLink href="/news">News</TextLink>
      </li>
      <li>
        <TextLink href="/enterprise">Enterprise</TextLink>
      </li>
      <li>
        <TextLink href="/faq">FAQ</TextLink>
      </li>
    </ul>
    <ul styleName="footer-nav">
      <li>
        <TextLink href="/privacy">Privacy</TextLink>
      </li>
      <li>
        <TextLink href="/terms">Terms</TextLink>
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
        <TextLink target="_" href="https://blog.leavemealone.app">
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
          <MailIcon width="20" height="20" />
        </TextLink>
      </li>
    </ul>
    <ul styleName="footer-nav">
      <li>
        <TextLink href="/login">Log in</TextLink>
      </li>
      <li>
        <TextLink href="/signup">Sign up</TextLink>
      </li>
    </ul>
  </div>
);
