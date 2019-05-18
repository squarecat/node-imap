import './list.module.scss';

import MailItem from '../item';
import React from 'react';

function MailList({ mail }) {
  return (
    <ul styleName="list">
      {mail.map(id => {
        return (
          <li styleName="item" key={id}>
            <MailItem id={id} />
          </li>
        );
      })}
    </ul>
  );
}

export default MailList;
