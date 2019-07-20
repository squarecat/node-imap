import { MailIcon, TwitterIcon } from '../icons';

import { Link } from 'gatsby';
import React from 'react';
import { TextLink } from '../text';
import cx from 'classnames';
import styles from './footer.module.scss';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

export default visProps => (
  <div
    className={cx(styles.footer, {
      [styles.subpage]: visProps.subpage
    })}
  >
    <div styleName="footer-inner">
      <div styleName="footer-intro">
        <Link to="/" styleName="footer-logo">
          <img alt="Leave Me Alone logo" src={logoUrl} />
          <span styleName="footer-title">Leave Me Alone</span>
        </Link>
        <ul styleName="footer-nav-intro">
          <li>
            <TextLink href="/app">Log in</TextLink>
          </li>
          <li>
            <TextLink href="/signup">Sign up</TextLink>
          </li>
        </ul>
      </div>
      <div styleName="footer-links">
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
            <TextLink href="/teams">For Teams</TextLink>
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
            <TextLink href="/security">Security</TextLink>
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
            <TextLink href="/open">Open stats</TextLink>
          </li>
          <li>
            <TextLink href="/wall-of-love">Wall of Love</TextLink>
          </li>
          <li>
            <TextLink
              target="_blank"
              rel="noopener noreferrer"
              href="/feedback"
            >
              Give us feedback
            </TextLink>
          </li>
          <li>
            <TextLink target="_blank" rel="noopener noreferrer" href="/bugs">
              Report a bug
            </TextLink>
          </li>
          <li>
            <TextLink href="javascript:window.Metomic.raise()">
              Manage cookies
            </TextLink>
          </li>
          <li>
            <TextLink href="https://clearbit.com" target="_">
              Logos from Clearbit
            </TextLink>
          </li>
        </ul>
        {/* <ul styleName="footer-nav">
        <li>
          <TextLink href="/login">Log in</TextLink>
        </li>
        <li>
          <TextLink href="/signup">Sign up</TextLink>
        </li>
      </ul> */}
      </div>
      <ul styleName="footer-social">
        <li title="@LeaveMeAloneApp">
          <TextLink undecorated href="https://twitter.com/leavemealoneapp">
            <TwitterIcon />
          </TextLink>
        </li>
        <li title="hello@leavemealone.app">
          <TextLink undecorated href="mailto:hello@leavemealone.app">
            <MailIcon width="20" height="20" />
          </TextLink>
        </li>
      </ul>
      <div styleName="made-by">
        <span>
          Made by <TextLink href="https://squarecat.io">Squarecat</TextLink>
        </span>
      </div>
    </div>
  </div>
);
