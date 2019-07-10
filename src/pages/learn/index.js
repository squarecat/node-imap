import './learn.module.scss';

import {
  Arrow as ArrowIcon,
  ConnectIcon,
  SearchIcon,
  ToggleIcon
} from '../../components/icons';
import SubPageLayout, { SubpageTagline } from '../../layouts/subpage-layout';

import React from 'react';
import Testimonial from '../../components/landing/testimonial';
import { TextLink } from '../../components/text';
import connectAccountsImg from '../../assets/accounts.png';
import creditsImg from '../../assets/learn/credits.png';
import frequencyImg from '../../assets/learn/frequency2.png';
import heartGif from '../../assets/heart.gif';
import mailImg from '../../assets/example-spam-2.png';
import reminderImg from '../../assets/learn/reminder.png';
import searchbarImg from '../../assets/learn/searchbar.png';
import spamLabelImg from '../../assets/learn/spam.png';
import subscriberScoreImg from '../../assets/subscriber-score.png';
import tom from '../../assets/tom.jpg';

export default function Learn() {
  return (
    <SubPageLayout
      title="How it works"
      description={`Start unsubscribing in 3 simple steps: 1. Connect your account 2. Scan your inbox 3. Unsubscribe from spam.`}
    >
      <div>
        <h1>How does Leave Me Alone work?</h1>

        <SubpageTagline>
          Start unsubscribing in 3 simple steps - let's go!
        </SubpageTagline>

        <ol styleName="steps">
          <li styleName="step">
            <span styleName="step-icon">
              <ConnectIcon width="40" height="48" />
            </span>
            <h3 styleName="step-title">Connect</h3>
            <p styleName="step-description">
              Connect each of your email accounts and clean all of your inboxes
              at once.
            </p>
          </li>
          <span styleName="step-arrow">
            <ArrowIcon width="20" height="20" />
          </span>
          <li styleName="step">
            <span styleName="step-icon">
              <SearchIcon width="40" height="40" />
            </span>
            <h3 styleName="step-title">Scan</h3>
            <p styleName="step-description">
              See all of your spam, newsletters, and subscription emails in one
              place.
            </p>
          </li>
          <span styleName="step-arrow">
            <ArrowIcon width="20" height="20" />
          </span>
          <li styleName="step step-unsubscribe">
            <span styleName="step-icon">
              <ToggleIcon width="56" height="56" />
            </span>
            <h3 styleName="step-title">Unsubscribe</h3>
            <p styleName="step-description">
              One click and that subscription email is gone forever - just like
              magic!
            </p>
          </li>
        </ol>
      </div>

      <div styleName="features">
        <h2>How do I use Leave Me Alone?</h2>

        <div styleName="feature">
          <div styleName="feature-text">
            <h3 styleName="feature-title">One click unsubscribe</h3>
            <p>
              To unsubscribe from the emails you don't want just click the
              toggle and we will do the hard work for you.
            </p>
            <p>
              If there's an unsubscribe link provided we follow it and
              unsubscribe you. If there's no link, we send an email using a
              unique address which identifies your subscription.
            </p>
          </div>
          <div styleName="feature-img">
            <img
              src={mailImg}
              alt="a subscription email item showing the sender and how many times it has been received"
            />
          </div>
        </div>

        <div styleName="feature image-left">
          <div styleName="feature-img bordered">
            <img src={connectAccountsImg} alt="connected accounts image" />
          </div>
          <div styleName="feature-text">
            <h3 styleName="feature-title">Clean all of your inboxes at once</h3>
            <p>
              Connect all of your email accounts and scan them together. Clear
              out all of your subscription emails from all of your email
              addresses in one go.
            </p>
          </div>
        </div>

        <div styleName="feature">
          <div styleName="feature-text">
            <h3 styleName="feature-title">Credits</h3>
            <p>1 credit = 1 unsubscribe.</p>
            <p>Only pay for what you want to unsubscribe from.</p>
            <p>
              Earn more credits for inviting friends, tweeting about us,
              reaching milestones and more!
            </p>
          </div>
          <div styleName="feature-img bordered">
            <img src={creditsImg} alt="your credits balance modal" />
          </div>
        </div>

        <div styleName="feature image-left">
          <div styleName="feature-img bordered">
            <img
              src={searchbarImg}
              alt="the mail list search bar with filtering and sorting options"
            />
          </div>
          <div styleName="feature-text">
            <h3 styleName="feature-title">Customisable mail list</h3>
            <p>
              Filter and sort your mail by email address, date received, score,
              and more.
            </p>
            <p>
              We will keep your list up to date so each time you log in your new
              subscription emails will be ready to view.
            </p>
          </div>
        </div>

        <div styleName="feature">
          <div styleName="feature-text">
            <h3 styleName="feature-title">Subscriber Score</h3>
            <p>
              Quickly determine which emails are worth keeping using our
              revolutionary ranking system.
            </p>
            <p>
              There's some clever math behind the scenes so you can see which
              emails spam you the most and how many other people decided to
              unsubscribe!
            </p>
            <p>
              <TextLink href="/security">
                Learn more about how we power Subscriber Score{' '}
                <ArrowIcon width="16" height="16" />
              </TextLink>
            </p>
          </div>
          <div styleName="feature-img">
            <img
              src={subscriberScoreImg}
              alt="subscriber score for a subscription email showing a rating of C"
            />
          </div>
        </div>

        <div styleName="feature  image-left">
          <div styleName="feature-img">
            <div styleName="heart-gif">
              <img
                src={heartGif}
                alt="animation of clicking the favourite sender button"
              />
            </div>
          </div>
          <div styleName="feature-text">
            <h3 styleName="feature-title">Keep your favourites</h3>
            <p>Not all subscription email is spam!</p>
            <p>
              Add senders you want to keep to your favourites and prevent
              accidental unsubscribes from the newsletters you actually read.
            </p>
          </div>
        </div>

        <div styleName="feature">
          <div styleName="feature-text">
            <h3 styleName="feature-title">Frequency of emails</h3>
            <p>
              See how many emails you have received from a sender in the last 6
              months.
            </p>
            <p>
              Daily and weekly newsletters will show high numbers but some
              senders may surprise you with their frequency.
            </p>
          </div>
          <div styleName="feature-img">
            <img
              src={frequencyImg}
              alt="frequency tooltip showing 42 LinkedIn emails were received in the last 6 months"
            />
          </div>
        </div>

        <div styleName="feature image-left">
          <div styleName="feature-img bordered">
            <img
              src={spamLabelImg}
              alt="a subscription email with a spam label"
            />
          </div>
          <div styleName="feature-text">
            <h3 styleName="feature-title">Scan all your folders</h3>
            <p>
              We scan all of your folders including your trash and spam for the
              deepest of cleans.
            </p>
            <p>
              We'll let you know if an email was seen in your trash or spam
              folder.
            </p>
          </div>
        </div>

        <div styleName="feature">
          <div styleName="feature-text">
            <h3 styleName="feature-title">Set a reminder</h3>
            <p>
              Those subscriptions will start creeping up again and unfortunately
              we can't clean up emails from the future.
            </p>
            <p>Set a reminder to clean your inbox again whenever suits you!</p>
          </div>
          <div styleName="feature-img">
            <img
              src={reminderImg}
              alt="setting a reminder to scan again in 6 months"
            />
          </div>
        </div>

        <Testimonial
          text={`I must admit I'm lazy at unsubscribing to subscription emails, so my email inbox grows at an alarming rate every day. I just used Leave Me Alone and unsubscribed to 15 emails in 3 minutes. What a great idea!`}
          author="Tom Haworth, Managing Director - B13 Technology"
          image={tom}
          centered
        />

        <a
          href="/signup"
          className={`beam-me-up-cta beam-me-up-cta-center`}
          style={{ marginTop: '50px' }}
        >
          Get Started For Free!
        </a>
      </div>
    </SubPageLayout>
  );
}
