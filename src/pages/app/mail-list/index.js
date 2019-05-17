import { MailContext, MailProvider } from './provider';
import React, { useContext, useEffect, useState } from 'react';

import Button from '../../../components/btn';
import { FormSelect } from '../../../components/form';
import MailList from './list';
import Pagination from 'react-paginate';
import { Refresh as RefreshIcon } from '../../../components/icons';
import styles from './mail-list.module.scss';

function MailView() {
  const { state, dispatch } = useContext(MailContext);
  const {
    refresh,
    totalCount,
    isLoading,
    filterValues,
    mail,
    perPage,
    page,
    activeFilters
  } = state;

  const [options, setOptions] = useState({
    pageCount: 1,
    offset: 0,
    totalOnPage: 0
  });

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

  const recipientValue = activeFilters.find(v => v.type === 'to');
  return (
    <div styleName="mail-list">
      <div styleName="filters">
        <FormSelect
          pill
          onChange={({ currentTarget }) => {
            const { value } = currentTarget;
            if (!value) {
              return dispatch({
                type: 'remove-active-filter',
                data: { field: 'to' }
              });
            }
            dispatch({
              type: 'set-active-filter',
              data: { field: 'to', type: 'equals', value }
            });
          }}
          name="filter-recipient"
          compact
          options={filterValues['recipients'].map(v => ({
            value: v,
            label: v
          }))}
          value={recipientValue ? recipientValue.value : null}
          basic
          placeholder="All addresses"
        />
        <span styleName="refresh">
          <Button muted compact basic outlined square onClick={refresh}>
            Refresh <RefreshIcon width="12" height="12" />
          </Button>
        </span>
      </div>
      <div styleName="content">
        {isLoading ? <MailList mail={mail} /> : null}
      </div>
      <div styleName="footer">
        <Pagination
          previousLabel={'previous'}
          nextLabel={'next'}
          breakLabel={'...'}
          breakClassName={'break-me'}
          pageCount={options.pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={10}
          onPageChange={({ selected }) =>
            dispatch({ type: 'set-page', data: selected })
          }
          containerClassName={styles.pagination}
          subContainerClassName={styles.paginationPages}
          activeClassName={styles.paginationActive}
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
