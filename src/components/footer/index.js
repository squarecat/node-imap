import './footer.module.scss';

import { FacebookIcon, LinkedInIcon, MailIcon, TwitterIcon } from '../icons';

import { Link } from 'gatsby';
import React from 'react';
import { TextLink } from '../text';
import oneTreePlantedImg from '../../assets/climate/one-tree-planted/OneTreePlanted-horizontal-white.png';

// import oneTreePlantedImg from '../../assets/climate/one-tree-planted/ReforestationPartnerLogo.png';

const TREE_ORG_LINK = 'https://onetreeplanted.org';
const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

export default () => (
  <div styleName="footer">
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
          <h4 styleName="footer-nav-title">Company</h4>
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
            <TextLink href="/news">In the news</TextLink>
          </li>
          <li>
            <TextLink href="/teams">For Teams</TextLink>
          </li>
          <li>
            <TextLink href="/save-the-planet">Save the planet</TextLink>
          </li>
        </ul>
        <ul styleName="footer-nav">
          <h4 styleName="footer-nav-title">Privacy</h4>
          <li>
            <TextLink href="/security">Security</TextLink>
          </li>
          <li>
            <TextLink href="/privacy">Privacy policy</TextLink>
          </li>
          <li>
            <TextLink href="/terms">Terms of use</TextLink>
          </li>
        </ul>
        <ul styleName="footer-nav">
          <h4 styleName="footer-nav-title">Support</h4>
          <li>
            <TextLink href="/faq">FAQ</TextLink>
          </li>
          <li>
            <TextLink target="_" href="https://status.leavemealone.app">
              Status
            </TextLink>
          </li>
          <li>
            <TextLink
              target="_blank"
              rel="noopener noreferrer"
              href="/feedback"
            >
              Submit feedback
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
        </ul>
        <ul styleName="footer-nav">
          <h4 styleName="footer-nav-title">Works With</h4>
          <li>
            <TextLink href="/providers/google">Google</TextLink>
          </li>
          <li>
            <TextLink href="/providers/microsoft">Microsoft</TextLink>
          </li>
          <li>
            <TextLink href="/providers/imap">IMAP</TextLink>
          </li>
        </ul>
        <ul styleName="footer-nav">
          <h4 styleName="footer-nav-title">Open</h4>
          <li>
            <TextLink href="/open">Open stats</TextLink>
          </li>
          <li>
            <TextLink href="/wall-of-love">Wall of Love</TextLink>
          </li>
          <li>
            <TextLink target="_blank" rel="noopener noreferrer" href="/roadmap">
              Roadmap
            </TextLink>
          </li>
          <li>
            <TextLink href="https://blog.leavemealone.app">Blog</TextLink>
          </li>
          <li>
            <TextLink
              target="_"
              href="https://simpleanalytics.com/leavemealone.app"
            >
              Analytics
            </TextLink>
          </li>
          <li>
            <TextLink target="_" href="http://leavemealone.releasepage.co">
              Releases
            </TextLink>
          </li>
        </ul>
      </div>

      <div styleName="footer-bottom">
        <div styleName="made-by">
          <span>
            Made by <TextLink href="https://squarecat.io">Squarecat</TextLink>
          </span>
        </div>
        <ul styleName="footer-social">
          <li title="@LeaveMeAloneApp">
            <TextLink undecorated href="https://twitter.com/leavemealoneapp">
              <TwitterIcon />
            </TextLink>
          </li>
          <li title="@LeaveMeAloneApp">
            <TextLink undecorated href="https://facebook.com/leavemealoneapp">
              <FacebookIcon />
            </TextLink>
          </li>
          <li title="hello@leavemealone.app">
            <TextLink undecorated href="mailto:hello@leavemealone.app">
              <MailIcon width="20" height="20" />
            </TextLink>
          </li>
          <li>
            <TextLink
              undecorated
              href="https://linkedin.com/showcase/leave-me-alone-app"
            >
              <LinkedInIcon width="20" height="20" />
            </TextLink>
          </li>
        </ul>
        <a styleName="one-tree-planted" href={TREE_ORG_LINK}>
          <img
            src={oneTreePlantedImg}
            alt="One Tree Planted reforestation partner logo"
          />
        </a>
      </div>
    </div>
  </div>
);
