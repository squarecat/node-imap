import './header.module.scss';

import Dropdown, {
  DropdownItem,
  DropdownList
} from '../../../components/dropdown';
import { Link, StaticQuery, graphql } from 'gatsby';

import Img from 'gatsby-image';
import React from 'react';
import cx from 'classnames';

export default ({ setActive = () => {}, inverted = false }) => (
  <div
    styleName={cx('landing-header', { 'landing-header-inverted': inverted })}
  >
    {/* <div styleName="ref-banner">
      {bannerShown ? (
        <span>
          ❤ Happy Valentines Day! Today only have 40% off all{' '}
          <a href="/gifts">gift purchases</a> ❤
        </span>
      ) : null}
    </div> */}
    <div styleName="landing-header-inner">
      <Link to="/" styleName="landing-header-logo">
        <StaticQuery
          query={graphql`
            query {
              logo: file(relativePath: { eq: "logo.png" }) {
                childImageSharp {
                  fixed(width: 60, height: 40) {
                    ...GatsbyImageSharpFixed_withWebp
                  }
                }
              }
            }
          `}
          render={data => (
            <Img
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
