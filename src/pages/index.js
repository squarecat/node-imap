import React, { useRef, useEffect } from 'react';
import { Link } from 'gatsby';

import gmailLogo from '../assets/gmail.png';
import Layout from '../components/layout';
import Image from '../components/image';
import './home.css';

const IndexPage = () => {
  const gender = 'f';
  const activeRef = useRef(null);
  const setActive = isActive => {
    activeRef.current.classList[isActive ? 'add' : 'remove']('active');
  };
  return (
    <Layout>
      <div className="friendly-neighbourhood-hero">
        <div>
          <h1>
            <div className="leave-me-alone-logo" ref={activeRef}>
              <span>
                <img src={gmailLogo} alt="gmail-logo" />
              </span>
              <span className="logo-emoji">
                {gender === 'f' ? '🙅‍♀' : '🙅‍♂️'}
              </span>
            </div>
          </h1>
          <h2 className="title">Leave me alone!</h2>
          <p className="catchy-tagline">
            Take back control of your inbox by telling subscription spammers to
            leave you alone!
          </p>
          <Link
            as="a"
            to="/login"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            className={`beam-me-up-cta beam-me-up-cta--${gender}`}
          >
            Sign me up!
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;
