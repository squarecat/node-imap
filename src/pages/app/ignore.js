import React from 'react';

import Button from '../../components/btn';
import Template from './template';
import useUser from '../../utils/hooks/use-user';

import './ignore.css';

export async function toggleFromIgnoreList(email, op) {
  const resp = await fetch('/api/me/ignore', {
    method: 'PATCH',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ op, value: email })
  });
  return resp.json();
}

export default () => {
  const [user, { setIgnoredSenderList }] = useUser();
  const ignoredSenderList = user.ignoredSenderList || [];

  const remove = email => {
    toggleFromIgnoreList(email, 'remove');
    setIgnoredSenderList(ignoredSenderList.filter(sender => sender !== email));
  };

  return (
    <Template>
      <div className="scan-list">
        <p>
          Showing <span className="scan-size">{ignoredSenderList.length}</span>{' '}
          ignored senders. Emails from these addresses will not show up in any
          future scans.
        </p>
        <table>
          <tbody>
            {ignoredSenderList.map(sender => {
              return (
                <tr key={sender} className="scan-item">
                  <td>{sender}</td>
                  <td>
                    <Button compact basic muted onClick={() => remove(sender)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Template>
  );
};
