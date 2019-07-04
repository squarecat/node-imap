import { Empty, Loading } from './states';
import { MailContext, MailProvider } from './provider';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import Filters from './filters';
import MailList from './list';
import { ModalContext } from '../../providers/modal-provider';
import Pagination from 'react-paginate';
import UnsubModal from '../../components/modal/unsub-modal';
import styles from './mail-list.module.scss';

function MailView() {
  const { state, dispatch, actions } = useContext(MailContext);
  const { open: openModal, onClose } = useContext(ModalContext);
  const {
    fetch,
    totalCount,
    isLoading,
    mail,
    perPage,
    page,
    filterValues,
    sortValues,
    sortByValue,
    sortByDirection,
    activeFilters,
    isFetching,
    unsubData
  } = state;

  // fetch new messages on load and
  // check for new messages each 30 seconds?
  useEffect(() => {
    fetch();
  }, []);

  // scroll back to the top if the page changes
  useEffect(
    () => {
      window.scrollTo(0, 0);
    },
    [page]
  );

  const { offset, totalOnPage, pageCount } = useMemo(
    () => {
      const os = page * perPage;
      return {
        pageCount: Math.ceil(totalCount / perPage),
        totalOnPage: Math.min(os + perPage, totalCount),
        offset: os
      };
    },
    [perPage, totalCount, page]
  );

  const onSubmit = useCallback(
    ({ success, useImage, failReason = null }) => {
      const { id, from, unsubStrategy } = unsubData;
      actions.setUnsubData(null);
      actions.resolveUnsubscribeError({
        success,
        mailId: id,
        useImage,
        from: from,
        reason: failReason,
        unsubStrategy: unsubStrategy
      });
    },
    [actions, unsubData]
  );

  const clearUnsubData = useCallback(
    () => {
      actions.setUnsubData(null);
    },
    [actions]
  );

  useEffect(
    () => {
      if (unsubData) {
        openModal(<UnsubModal onSubmit={onSubmit} mail={unsubData} />, {
          onClose: clearUnsubData
        });
      }
    },
    [unsubData, actions, openModal, onSubmit, clearUnsubData, onClose]
  );

  const content = useMemo(
    () => {
      const showLoading = (isLoading || isFetching) && !mail.length;
      if (showLoading) {
        return <Loading />;
      }
      if (!mail.length) {
        return <Empty hasFilters={activeFilters.length} />;
      }
      return <MailList mail={mail} />;
    },
    [isLoading, isFetching, mail, activeFilters]
  );
  return (
    <div styleName="mail-list">
      <Filters
        filterValues={filterValues}
        sortValues={sortValues}
        sortByValue={sortByValue}
        sortByDirection={sortByDirection}
        activeFilters={activeFilters}
        showLoading={isFetching}
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
          <span>
            Showing{' '}
            <span styleName="page-count">{`${offset ||
              1}-${totalOnPage}`}</span>{' '}
            of <span styleName="total-count">{totalCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default () => {
  return (
    <MailProvider>
      <MailView />
    </MailProvider>
  );
};
