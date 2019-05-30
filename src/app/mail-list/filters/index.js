import './filters.module.scss';

import React, { useContext } from 'react';

import { FormSelect } from '../../../components/form';
import { MailContext } from '../provider';

export default React.memo(
  ({
    filterValues,
    sortValues,
    sortByValue,
    sortByDirection,
    activeFilters
  }) => {
    const { dispatch } = useContext(MailContext);
    const recipientValue = activeFilters.find(v => v.field === 'to');
    return (
      <div styleName="filters">
        Show mail for
        <span styleName="filter-field">
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
            value={recipientValue ? recipientValue.value : ''}
            basic
            placeholder="All addresses"
          />
        </span>
        <span>and sort by</span>
        <span styleName="filter-field">
          <FormSelect
            pill
            onChange={({ currentTarget }) => {
              const { value } = currentTarget;
              if (!value) {
                return dispatch({
                  type: 'set-sort-by',
                  data: 'date'
                });
              }
              dispatch({
                type: 'set-sort-by',
                data: value
              });
            }}
            name="sort-by"
            compact
            options={sortValues.map(v => ({
              value: v,
              label: v
            }))}
            value={sortByValue ? sortByValue : 'date'}
            basic
          />
        </span>
        ordered by
        <span styleName="filter-field">
          <FormSelect
            pill
            onChange={({ currentTarget }) => {
              const { value } = currentTarget;
              dispatch({
                type: 'set-sort-direction',
                data: value
              });
            }}
            name="sort-by-direction"
            compact
            options={
              sortByValue === 'date'
                ? [
                    {
                      value: 'asc',
                      label: 'oldest first'
                    },
                    {
                      value: 'desc',
                      label: 'newest first'
                    }
                  ]
                : [
                    {
                      value: 'asc',
                      label: 'low to high'
                    },
                    {
                      value: 'desc',
                      label: 'high to low'
                    }
                  ]
            }
            value={sortByDirection}
            basic
          />
        </span>
      </div>
    );
  }
);
