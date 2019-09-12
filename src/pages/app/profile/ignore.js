import './ignore.module.scss';

import React, { useCallback, useMemo } from 'react';
import Table, { TableCell, TableRow } from '../../../components/table';

import Button from '../../../components/btn';
import ErrorBoundary from '../../../components/error-boundary';
import ProfileLayout from '../../../app/profile/layout';
import { TextImportant } from '../../../components/text';
import { toggleFromIgnoreList } from '../../../utils/ignore';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [user, { setIgnoredSenderList }] = useUser();
  const ignoredSenderList = user.ignoredSenderList || [];

  const remove = useCallback(
    email => {
      toggleFromIgnoreList(email, 'remove');
      setIgnoredSenderList(
        ignoredSenderList.filter(sender => sender !== email)
      );
    },
    [ignoredSenderList, setIgnoredSenderList]
  );

  const content = useMemo(() => {
    if (ignoredSenderList.length) {
      return (
        <>
          <p styleName="content">
            Showing{' '}
            <TextImportant>
              {ignoredSenderList.length} favorite senders
            </TextImportant>
            . Emails from these addresses will not show up in any future scans.
          </p>
          <ErrorBoundary>
            <Table>
              <tbody styleName="table">
                {ignoredSenderList.map(sender => {
                  return (
                    <TableRow key={sender}>
                      <TableCell>
                        <span styleName="sender">{sender}</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          compact
                          basic
                          muted
                          onClick={() => remove(sender)}
                        >
                          <span styleName="desktop">Remove</span>
                          <span styleName="mobile">x</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          </ErrorBoundary>
        </>
      );
    }
    return (
      <>
        <p styleName="content">
          Favorite a sender by <TextImportant>clicking the heart</TextImportant>{' '}
          next to their name in the mail list. Favorite senders will not show up
          in future so you don't have to worry about unsubscribing from them
          accidentally.
        </p>
        <p styleName="content">Your favorite senders will show up here.</p>
      </>
    );
  }, [ignoredSenderList, remove]);

  return (
    <ProfileLayout pageName="Favorite Senders">
      <div styleName="ignore-section">{content}</div>
    </ProfileLayout>
  );
};
