import './ph-badges.module.scss';

import React from 'react';

export default () => (
  <div styleName="badges">
    <a
      styleName="ph-badge"
      href="https://www.producthunt.com/posts/leave-me-alone-3?utm_source=badge-top-post-badge"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=143797&theme=light"
        alt="Leave Me Alone - Easily unsubscribe from spam emails 💌 | #1 Product of the Day Product Hunt Embed"
        style={{ width: 250, height: 54 }}
        width="250px"
        height="54px"
      />
    </a>
    <a
      styleName="ph-badge"
      href="https://www.producthunt.com/posts/leave-me-alone-3?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-leave-me-alone-3"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=143797&theme=light&period=weekly"
        alt="Leave Me Alone - Easily unsubscribe from spam emails 💌 | #1 Product of the Week Product Hunt Embed"
        style={{ width: 250, height: 54 }}
        width="250px"
        height="54px"
      />
    </a>
  </div>
);
