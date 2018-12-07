import React from 'react';

import './footer.css';

export default () => (
  <div className="footer">
    <ul className="footer-nav">
      <li>
        <a className="link" href="/privacy">
          Privacy
        </a>
      </li>
      <li>
        <a className="link" href="/terms">
          Terms
        </a>
      </li>
      <li>
        <a className="link" href="/faq">
          FAQ
        </a>
      </li>
      <li>
        <a
          className="link"
          target="_blank"
          rel="noopener noreferrer"
          href="http://leavemealone.releasepage.co"
        >
          Releases
        </a>
      </li>
      <li>
        <a
          className="link"
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.notion.so/33d2efb925634020a1cd64d40b91efe4"
        >
          Roadmap
        </a>
      </li>
    </ul>
    <ul className="footer-social">
      <li title="@LeaveMeAloneApp">
        <a href="https://twitter.com/leavemealoneapp">
          <svg id="i-twitter" viewBox="0 0 64 64" width="20" height="20">
            <path
              strokeWidth="0"
              fill="currentColor"
              d="M60 16 L54 17 L58 12 L51 14 C42 4 28 15 32 24 C16 24 8 12 8 12 C8 12 2 21 12 28 L6 26 C6 32 10 36 17 38 L10 38 C14 46 21 46 21 46 C21 46 15 51 4 51 C37 67 57 37 54 21 Z"
            />
          </svg>
        </a>
      </li>
      <li title="leavemealone@squarecat.io">
        <a href="mailto:leavemealone@squarecat.io">
          <svg
            id="i-mail"
            viewBox="0 0 32 32"
            width="20"
            height="20"
            fill="none"
            stroke="currentcolor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path d="M2 26 L30 26 30 6 2 6 Z M2 6 L16 16 30 6" />
          </svg>
        </a>
      </li>
    </ul>
  </div>
);
