import React from 'react';
import ErrorBoundary from '../../../components/error-boundary';

import Button from '../../../components/btn';
import ProfileLayout from './layout';
import useUser from '../../../utils/hooks/use-user';

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
    <ProfileLayout pageName="Favorite Senders">
      <div className="profile-section profile-section--unpadded">
        <p>
          Showing{' '}
          <span className="text-important">{ignoredSenderList.length}</span>{' '}
          favorite senders. Emails from these addresses will not show up in any
          future scans.
        </p>
        <ErrorBoundary>
          <table className="ignore-table">
            <tbody>
              {ignoredSenderList.map(sender => {
                return (
                  <tr key={sender} className="ignore-item">
                    <td>{sender}</td>
                    <td>
                      <Button
                        compact
                        basic
                        muted
                        onClick={() => remove(sender)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ErrorBoundary>
      </div>
    </ProfileLayout>
  );
};
