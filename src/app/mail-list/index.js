import { Empty, Loading } from './states';
import { MailContext, MailProvider } from './provider';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import Filters from './filters';
import MailList from './list';
import { ModalContext } from '../../providers/modal-provider';
import Pagination from 'react-paginate';
import Progress from './progress';
import cx from 'classnames';
import styles from './mail-list.module.scss';
import useProgress from './db/use-progress';
import useUser from '../../utils/hooks/use-user';

const MailView = React.memo(function MailView() {
  const { state, dispatch, actions } = useContext(MailContext);
  // const { open: openModal } = useContext(ModalContext);
  const progress = useProgress();
  const [accounts] = useUser(u => u.accounts);
  const {
    totalCount,
    isLoading,
    mail,
    perPage,
    page,
    filterValues,
    sortValues,
    sortByValue,
    sortByDirection,
    activeFilters
  } = state;
  const { inProgress } = progress;

  // fetch new messages on load and
  // TODO check for new messages each 30 seconds?
  useEffect(() => {
    if (accounts.length) {
      actions.fetch();
    }
  }, [accounts.length, actions, actions.fetch]);

  // scroll back to the top if the page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const { offset, totalOnPage, pageCount } = useMemo(() => {
    const os = page * perPage;
    return {
      pageCount: Math.ceil(totalCount / perPage),
      totalOnPage: Math.min(os + perPage, totalCount),
      offset: os
    };
  }, [perPage, totalCount, page]);

  // const onSubmit = useCallback(
  //   ({ success, useImage, failReason = null }) => {
  //     const { id, from, unsubStrategy } = unsubData;
  //     actions.setUnsubData(null);
  //     actions.resolveUnsubscribeError({
  //       success,
  //       mailId: id,
  //       useImage,
  //       from: from,
  //       reason: failReason,
  //       unsubStrategy
  //     });
  //   },
  //   [actions, unsubData]
  // );

  // useEffect(() => {
  //   if (unsubData) {
  //     openModal(<UnsubModal onSubmit={onSubmit} mail={unsubData} />, {
  //       onClose: () => actions.setUnsubData(null)
  //     });
  //   }
  // }, [actions, onSubmit, openModal, unsubData]);

  const showLoading = (isLoading || inProgress) && !mail.length;
  const content = useMemo(() => {
    if (showLoading) {
      return <Loading />;
    }
    if (!mail.length || !accounts.length) {
      return <Empty hasFilters={activeFilters.length} />;
    }
    return <MailList mail={mail} />;
  }, [showLoading, mail, accounts.length, activeFilters.length]);

  const countStyles = cx(styles.countText, {
    [styles.shown]: !inProgress
  });
  return (
    <div styleName="mail-list">
      <Filters
        filterValues={filterValues}
        sortValues={sortValues}
        sortByValue={sortByValue}
        sortByDirection={sortByDirection}
        activeFilters={activeFilters}
      />
      <div styleName="content">{content}</div>
      <div styleName="footer">
        <Pagination
          previousLabel={'prev'}
          nextLabel={'next'}
          breakLabel={'...'}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={({ selected }) => {
            dispatch({ type: 'set-page', data: selected });
          }}
          containerClassName={styles.pagination}
          activeClassName={styles.paginationActive}
          pageClassName={styles.paginationPages}
          previousClassName={styles.prev}
          nextClassName={styles.next}
          breakClassName={styles.paginationBreak}
          forcePage={page}
        />
        <div styleName="count">
          <span className={countStyles}>
            Showing{' '}
            <span styleName="page-count">{`${offset ||
              1}-${totalOnPage}`}</span>{' '}
            of <span styleName="total-count">{totalCount}</span>
          </span>
          <Progress shown={inProgress} />
        </div>
      </div>
    </div>
  );
});

MailView.whyDidYouRender = true;

export default () => {
  return (
    <MailProvider>
      <MailView />
    </MailProvider>
  );
};
