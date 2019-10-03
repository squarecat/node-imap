import './header.module.scss';

import Dropdown, { DropdownItem, DropdownList } from '../../dropdown';
import { Link, StaticQuery, graphql } from 'gatsby';
import React, { useCallback, useState } from 'react';
import { differenceInCalendarDays, isBefore } from 'date-fns';

import { CloseIcon } from '../../icons';
import Img from 'gatsby-image';
import { TextLink } from '../../text';
import cx from 'classnames';

export default ({ setActive = () => {}, inverted = false }) => {
  const now = new Date();
  const launchDate = new Date(Date.UTC(2019, 9, 2, 2, 0, 0));
  const launchDateEnd = new Date(Date.UTC(2019, 9, 2, 23, 0, 0));
  const isBeforeLaunchDay = isBefore(now, launchDate);
  const isOnLaunchDay = !isBeforeLaunchDay && isBefore(now, launchDateEnd);
  const timeLeft = differenceInCalendarDays(launchDate, now);
  const [showBanner, setShowBanner] = useState(
    isBeforeLaunchDay || isOnLaunchDay
  );

  let bannerText;
  if (isBeforeLaunchDay) {
    bannerText = (
      <span>
        We are live streaming the official launch of Leave Me Alone v2.0 in{' '}
        {+timeLeft} days time!{' '}
        <TextLink inverted href="/live">
          Follow us on Twitch to get notified when it starts!
        </TextLink>{' '}
        ❤
      </span>
    );
  }
  if (isOnLaunchDay) {
    bannerText = (
      <span>
        We are live streaming the official launch of Leave Me Alone v2.0 RIGHT
        NOW!{' '}
        <TextLink inverted href="/live">
          Tune in and join us!
        </TextLink>{' '}
        ❤
      </span>
    );
  }

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  return (
    <div
      styleName={cx('landing-header', { 'landing-header-inverted': inverted })}
    >
      {/* {showBanner ? (
        <div styleName="ref-banner">
          <p>{bannerText}</p>
          <a styleName="close" onClick={dismissBanner}>
            <CloseIcon width="8" height="8" />
          </a>
        </div>
      ) : null} */}
      <div styleName="landing-header-inner">
        <Link to="/" styleName="landing-header-logo">
          <StaticQuery
            query={graphql`
              query {
                logo: file(relativePath: { eq: "logo.png" }) {
                  childImageSharp {
                    fixed(width: 60, height: 40) {
                      ...GatsbyImageSharpFixed_noBase64
                    }
                  }
                }
              }
            `}
            render={data => (
              <Img
                fadeIn={false}
                loading="eager"
                fixed={data.logo.childImageSharp.fixed}
                alt="Leave Me Alone logo"
              />
            )}
          />

          <span styleName="landing-header-title">Leave Me Alone</span>
        </Link>
        <ul styleName="nav">
          <LearnMoreDropdown />
          <li styleName="nav-link nav-extra">
            <Link to="/pricing">Pricing</Link>
          </li>
          <li styleName="nav-link nav-extra">
            <Link to="/teams">For Teams</Link>
          </li>
          <li styleName="nav-link nav-extra">
            <Link to="/app">Log in</Link>
          </li>
          <li styleName="nav-btn">
            <Link
              to="/signup"
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              styleName="signup-btn"
            >
              Sign up
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

function LearnMoreDropdown() {
  return (
    <li styleName="nav-link">
      <Dropdown toggleBtn={<a>Learn more</a>} toggleEvent="hover">
        <DropdownList>
          <DropdownItem>
            <Link to="/learn">How it works</Link>
          </DropdownItem>
          <DropdownItem>
            <Link to="/security">Security</Link>
          </DropdownItem>
          <DropdownItem>
            <Link to="/wall-of-love">Wall of Love</Link>
          </DropdownItem>
          <DropdownItem>
            <Link to="/about">About us</Link>
          </DropdownItem>
          <DropdownItem>
            <Link to="/faq">FAQ</Link>
          </DropdownItem>
          <DropdownItem>
            <Link to="/open">Open Startup</Link>
          </DropdownItem>

          <div styleName="learn-more-extras">
            <DropdownItem>
              <Link to="/pricing">Pricing</Link>
            </DropdownItem>
            <DropdownItem>
              <Link to="/teams">For Teams</Link>
            </DropdownItem>
            <DropdownItem separated>
              <Link to="/app">Log in</Link>
            </DropdownItem>
          </div>
        </DropdownList>
      </Dropdown>
    </li>
  );
}
