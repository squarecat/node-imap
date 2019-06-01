import { MailContext, MailProvider } from './provider';
import React, { useContext, useEffect, useState } from 'react';

import Filters from './filters';
import MailList from './list';
import Pagination from 'react-paginate';
import styles from './mail-list.module.scss';

function MailView() {
  const { state, dispatch } = useContext(MailContext);
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
    isFetching
  } = state;

  const [options, setOptions] = useState({
    pageCount: 1,
    offset: 0,
    totalOnPage: 0
  });

  // fetch new messages on load and
  // check for new messages each 30 seconds?
  useEffect(() => {
    fetch();
  }, []);

  useEffect(
    () => {
      const pageCount = Math.ceil(totalCount / perPage);
      const offset = page * perPage;
      const totalOnPage = Math.min(offset + perPage, totalCount);
      setOptions({
        ...options,
        pageCount,
        offset,
        totalOnPage
      });
    },
    [perPage, totalCount, page]
  );

  useEffect(
    () => {
      window.scrollTo(0, 0);
    },
    [page]
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
      <div styleName="content">
        {isLoading ? <MailList mail={mail} /> : null}
      </div>
      <div styleName="footer">
        <Pagination
          previousLabel={'prev'}
          nextLabel={'next'}
          breakLabel={'...'}
          pageCount={options.pageCount}
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
        />
        <div styleName="count">
          <span>
            Showing{' '}
            <span styleName="page-count">{`${options.offset || 1}-${
              options.totalOnPage
            }`}</span>{' '}
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
