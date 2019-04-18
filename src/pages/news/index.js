import './news.module.scss';

import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextLink } from '../../components/text';
import { useAsync } from '../../utils/hooks';

// Wish you could take back control of your inbox and declutter it without having to sacrifice your privacy?

function getNews() {
  return fetch('/api/news').then(resp => resp.json());
}

const InTheNewsPage = () => {
  const { value: news = [], loadingNews } = useAsync(getNews);

  const [quotes, list] = news.reduce(
    (out, n) => {
      if (n.simple) {
        return [out[0], [...out[1], n]];
      }
      return [[...out[0], n], out[1]];
    },
    [[], []]
  );

  return (
    <SubPageLayout page="In The News">
      <h1 styleName="title">In The News</h1>
      {loadingNews ? (
        <p>Loading...</p>
      ) : (
        <>
          <div styleName="news-list">
            {quotes.map(({ quote, logoUrl, url }) => (
              <div key={url} styleName="item">
                <p>"{quote}"</p>
                <a target="_" styleName="logo" href={url}>
                  <img src={logoUrl} />
                </a>
              </div>
            ))}
          </div>
          <div styleName="simple">
            <h2>Plus we are mentioned here:</h2>
            <ul>
              {list.map(({ url, name }) => (
                <li key={name}>
                  <TextLink target="_" href={url}>
                    {name}
                  </TextLink>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </SubPageLayout>
  );
};

export default InTheNewsPage;
