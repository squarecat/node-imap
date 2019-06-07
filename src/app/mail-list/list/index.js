import './list.module.scss';

import MailItem from '../item';
import React from 'react';

function MailList({ mail }) {
  return (
    <>
      <table styleName="list">
        <tbody>
          {mail.map(id => {
            return (
              <tr styleName="item" key={id}>
                <MailItem id={id} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default MailList;
