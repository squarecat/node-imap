import './about.module.scss';

import SubPageLayout, { SubpageTagline } from '../../layouts/subpage-layout';

import BetaTesters from '../../components/landing/beta-testers';
import React from 'react';
import { TextLink } from '../../components/text';
import danImg from '../../assets/about/dan_klammer.jpg';
import huskoImg from '../../assets/dogs-square.jpg';
import rocketImg from '../../assets/rocket.png';
import worldImg from '../../assets/geography.png';

// import { TwitterIcon } from '../../components/icons';

export default function About() {
  return (
    <SubPageLayout
      title="About"
      description={`Our mission is helping people keep control of their inbox. We are two independent founders looking to help you, and others like you.`}
      slug="/about"
    >
      <div styleName="mission image-section image-right">
        <div styleName="image-section-text">
          <h1>Our mission</h1>
          <SubpageTagline>
            Helping people{' '}
            <span style={{ textDecoration: 'underline' }}>keep</span> control of
            their inbox.
          </SubpageTagline>

          <p>
            In the Leave Me Alone office we're 100% committed to helping reduce
            the impact of spam emails on the world.
          </p>
          <p>
            When we first began investigating how we could make a difference we
            were amazed to discover that the majority of unwanted emails were
            from mailing lists which had been subscribed to intentionally.
          </p>
          <p>
            Usually these types of emails wouldn't be considered spam, which
            makes them difficult to filter out.
          </p>
          <p>We set out to solve this problem by providing two things;</p>
          <ul>
            <li>a way to see all spam, newsletters, and subscription emails</li>
            <li>
              a way to unsubscribe (not filter out) and get rid of those emails
              forever
            </li>
          </ul>
          <p>
            Leave Me Alone was born to help get rid of emails that you signed up
            for, but no longer want.
          </p>
        </div>
        <div styleName="image-section-img">
          <img alt="world globe in a cloud" src={worldImg} />
        </div>
      </div>

      <div styleName="image-section image-left">
        <div styleName="image-section-img">
          <img alt="rocket in a cloud" src={rocketImg} />
        </div>
        <div styleName="image-section-text">
          <h2>The future</h2>
          <p>
            Our response to unwanted emails is primarily reactive. We
            unsubscribe if we don't need them in an ever-lasting battle to take
            back control of our inbox.
          </p>
          <p>
            What if we could stop the never-ending cycle of taking back control
            and continue to keep control?
          </p>
          <p>
            We believe that this requires a shift from being reactive to being
            proactive.
          </p>
          <p>
            Being proactive means we would never give our email to these
            subscriptions in the first place.
          </p>
          <p>
            We think that the new Subscriber Score is a powerful way of
            addressing this and we will be looking at ways we can use it to
            bring our users closer to this vision.
          </p>
        </div>
      </div>

      <div styleName="image-section image-right">
        <div styleName="image-section-text">
          <h2>Who are we?</h2>
          <p>
            Hey!{' '}
            <span role="img" aria-label="wave">
              👋
            </span>{' '}
            We're Danielle and James, a couple of independent founders.
          </p>
          <p>
            Between us we have; <strong>lead front-end teams</strong> for the UK
            Governments biggest software engineering department, spoken at (and
            organised!) <strong>international dev conferences</strong>, been
            among the first employees of <strong>pioneering UK startups</strong>
            , <strong>taught young students</strong> the basics of programming,
            and delivered <strong>consistently successful software</strong> as
            freelancers.
          </p>
          <p>
            Now we work on products that help people because it's rewarding and
            we love it, which we think is a good reason to do just about
            anything!
          </p>
          <p>
            We're building Leave Me Alone on our own without funding or outside
            support. We're real people (not the huskies!) looking to help you,
            and others like you. ❤️
          </p>
        </div>
        <div styleName="image-section-img">
          <div styleName="huskos">
            <img
              alt="The two creators Danielle and James with two husky dogs"
              src={huskoImg}
            />
          </div>
        </div>
      </div>

      <div styleName="image-section image-right special-thanks">
        <div styleName="image-section-text">
          <h2>Special thanks</h2>
          <p>
            We are strong advocates of open source, and in this section we
            wanted to give special mention to the open source libraries that we
            couldn't do without. Keep up the good work everyone!
          </p>
        </div>
        <div styleName="image-section-img">
          <ul styleName="team-list oss">
            <li styleName="team-member">
              <img
                styleName="team-img"
                src={danImg}
                alt="profile picture of Dan Klammer"
              />
              <h4 styleName="team-name">Dan Klammer</h4>
              <TextLink href="https://github.com/danklammer/bytesize-icons">
                Bytesize Icons
              </TextLink>
            </li>
          </ul>
        </div>
        <p styleName="beta-text">
          We also want to thank our beta testers, who help make Leave Me Alone
          better every day!
        </p>
        <div styleName="beta-testers">
          <BetaTesters />
        </div>
      </div>
    </SubPageLayout>
  );
}
