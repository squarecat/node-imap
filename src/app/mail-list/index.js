import { MailContext, MailProvider } from './provider';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import Filters from './filters';
import MailList from './list';
import { ModalContext } from '../../providers/modal-provider';
import Pagination from 'react-paginate';
import UnsubModal from '../../components/modal/unsub-modal';
import loadingImg from '../../assets/envelope-logo.png';
import styles from './mail-list.module.scss';

function MailView() {
  const { state, dispatch, actions } = useContext(MailContext);
  const { open: openModal } = useContext(ModalContext);
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

  useEffect(
    () => {
      window.scrollTo(0, 0);
    },
    [page]
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

  useEffect(
    () => {
      if (unsubData) {
        openModal(<UnsubModal onSubmit={onSubmit} mail={unsubData} />, {
          onClose: () => actions.setUnsubData(null)
        });
      }
    },
    [unsubData, actions, openModal, onSubmit]
  );

  const showLoading = (isLoading || isFetching) && !mail.length;

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
      <div styleName="content">
        {showLoading ? <Loading /> : <MailList mail={mail} />}
      </div>
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

function Loading() {
  return (
    <div styleName="loading-wrapper">
      <div styleName="loading">
        <img styleName="loading-img" src={loadingImg} alt="loading image" />
        <div styleName="loading-text">Loading subscriptions...</div>
      </div>
    </div>
  );
}
