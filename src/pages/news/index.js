import './news.module.scss';

import {
  EditIcon,
  LinkIcon,
  SearchIcon,
  StarIcon
} from '../../components/icons';

import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextLink } from '../../components/text';
import request from '../../utils/request';
import useAsync from 'react-use/lib/useAsync';

// Wish you could take back control of your inbox and declutter it without having to sacrifice your privacy?

async function getNews() {
  return request('/api/news', {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

const InTheNewsPage = () => {
  return (
    <SubPageLayout
      title="In The News"
      description={`Read about Leave Me Alone featured in news articles around the world.`}
      slug="/news"
    >
      <h1 styleName="title">In The News</h1>
      <News />
      <div styleName="end-stuff">
        <h2>Want to know more?</h2>
        <p>
          Check out{' '}
          <TextLink as="link" linkTo="/learn">
            how it works
          </TextLink>
          , read about our{' '}
          <TextLink as="link" linkTo="/security">
            security
          </TextLink>
          , and find out more{' '}
          <TextLink as="link" linkTo="/about">
            about us and our mission
          </TextLink>
          .
        </p>
        <p style={{ margin: '50px auto' }}>Or...</p>
        <TextLink
          event="clicked-news-cta"
          href={`/signup`}
          className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
        >
          Sign Up Now!
        </TextLink>
      </div>
    </SubPageLayout>
  );
};

function News() {
  const { value: news, loading } = useAsync(getNews);

  if (loading) {
    return (
      <p styleName="loading">
        Hold tight, we're just fetching the articles, interviews, and case
        studies...
      </p>
    );
  }

  if (!news) {
    return (
      <p styleName="loading">
        Whoops! Something went wrong fetching the news, please try again or send
        us a message.
      </p>
    );
  }

  const { featured, caseStudies, directories, lmaInterviews, other } = news;

  return (
    <>
      <div styleName="list">
        {featured.map(({ quote, logoUrl, url, name }) => (
          <div key={url} styleName="item">
            <p>"{quote}"</p>
            <a target="_" styleName="logo" href={url}>
              <img src={logoUrl} alt={`${name} logo`} />
            </a>
          </div>
        ))}
      </div>

      <div styleName="section">
        <h2>Case Studies</h2>
        <p>
          Read more from our customers about the impact Leave Me Alone has had
          on their inboxes.
        </p>
        <div styleName="cards">
          {caseStudies.map(({ url, name }) => (
            <a href={url} target="_" styleName="card" key={url}>
              <span styleName="icon">
                <SearchIcon width="32" height="32" />
              </span>
              <TextLink href={url} target="_">
                {name}
              </TextLink>
            </a>
          ))}
        </div>
      </div>

      <div styleName="section">
        <h2>Behind the Scenes</h2>
        <p>
          First-hand accounts from Danielle and James on how Leave Me Alone was
          created.
        </p>
        <div styleName="cards">
          {lmaInterviews.map(({ url, name }) => (
            <a href={url} target="_" styleName="card" key={url}>
              <span styleName="icon">
                <EditIcon width="32" height="32" />
              </span>
              <TextLink href={url} target="_">
                {name}
              </TextLink>
            </a>
          ))}
        </div>
      </div>

      <div styleName="section">
        <h2>Recommendations</h2>
        <p>
          Leave Me Alone is listed among other top products in all of these
          places.
        </p>
        <div styleName="cards">
          {directories.map(({ url, name }) => (
            <a href={url} target="_" styleName="card" key={url}>
              <span styleName="icon">
                <StarIcon width="32" height="32" />
              </span>
              <TextLink href={url} target="_">
                {name}
              </TextLink>
            </a>
          ))}
        </div>
      </div>

      <div styleName="section">
        <h2>Extras</h2>
        <p>Plus, we are mentioned in all of these places too!</p>
        <div styleName="cards">
          {other.map(({ url, name }) => (
            <a href={url} target="_" styleName="card" key={url}>
              <span styleName="icon">
                <LinkIcon width="32" height="32" />
              </span>
              <TextLink href={url} target="_">
                {name}
              </TextLink>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export default InTheNewsPage;
