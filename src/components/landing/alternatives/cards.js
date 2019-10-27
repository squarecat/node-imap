import './alternative-cards.module.scss';

import { Arrow as ArrowIcon } from '../../icons';
import { Link } from 'gatsby';
import React from 'react';
import { TextLink } from '../../text';
import { openChat } from '../../../utils/chat';

const alternatives = [
  {
    name: 'Unroll.Me',
    path: 'leave-me-alone-vs-unroll-me',
    slug: 'unroll-me-alternative',
    description:
      "We have instant unsubscribes, multiple account support, and we won't ever sell your data. Learn more..."
  },
  {
    name: 'Unsubscriber',
    path: 'leave-me-alone-vs-unsubscriber',
    slug: 'unsubscriber-alternative',
    description:
      'We have Gmail support, newsletter quality ratings, and we never store the content of your emails. Read more...'
  },
  {
    name: 'Cleanfox',
    path: 'leave-me-alone-vs-cleanfox',
    slug: 'cleanfox-alternative',
    description:
      'We allow you to unsubscribe from all mailing lists at once, have live chat support, and also plant trees. More info...'
  }
];

export default () => (
  <div styleName="alternative-cards">
    {alternatives.map(({ name, slug, description }) => (
      <div styleName="card" key={`alternative-card-${name}`}>
        <Link to={slug}>
          <h3 styleName="title">
            <span styleName="lma">Leave Me Alone</span>{' '}
            <span styleName="vs">vs.</span>{' '}
            <span styleName="alternative-name">{name}</span>
          </h3>
          <p>{description}</p>
          <span styleName="compare-text">
            Compare Leave Me Alone vs. {name}{' '}
            <ArrowIcon inline width="12" height="12" />
          </span>
        </Link>
      </div>
    ))}
    <div styleName="card empty">
      <p>Are we missing an alternative?</p>
      <TextLink onClick={() => openChat()}>Let us know</TextLink>
    </div>
  </div>
);
