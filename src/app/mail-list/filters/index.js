import './filters.module.scss';

import React, { useContext, useMemo } from 'react';

import { FormSelect } from '../../../components/form';
import { MailContext } from '../provider';
import Spinner from '../../../components/loading/spinner';
import Tooltip from '../../../components/tooltip';

export default React.memo(
  ({
    filterValues = {
      recipients: []
    },
    sortValues = [],
    sortByValue = 'date',
    sortByDirection = 'desc',
    activeFilters = [],
    showLoading = false
  }) => {
    const { dispatch } = useContext(MailContext);
    const { recipients } = filterValues;

    let recipientValue = activeFilters.find(
      v => v.field === 'to' || v.field === 'forAccount'
    );
    if (recipientValue && recipientValue.field === 'forAccount') {
      recipientValue = `all/${recipientValue.value}`;
    } else if (recipientValue) {
      recipientValue = recipientValue.value;
    }
    const statusValue = activeFilters.find(v => v.field === 'status');
    const recipientValues = getRecipientValues(recipients);

    return (
      <div styleName="filters">
        <span>
          <span styleName="filter-text">Show</span>
          <span styleName="filter-field">
            <FormSelect
              pill
              onChange={({ currentTarget }) => {
                const { value } = currentTarget;
                if (!value) {
                  return dispatch({
                    type: 'remove-active-filter',
                    data: { field: 'status' }
                  });
                }
                dispatch({
                  type: 'set-active-filter',
                  data: { field: 'status', type: 'equals', value }
                });
              }}
              name="filter-recipient"
              compact
              options={[
                {
                  value: 'subscribed',
                  label: 'subscribed'
                },
                {
                  value: 'unsubscribed',
                  label: 'unsubscribed'
                },
                {
                  value: 'failed',
                  label: 'failed'
                }
              ]}
              value={statusValue ? statusValue.value : ''}
              basic
              placeholder="all"
            />
          </span>
          <span styleName="filter-text">mail addressed to</span>
          <span styleName="filter-field">
            <FormSelect
              pill
              onChange={({ currentTarget }) => {
                const { value } = currentTarget;
                if (!value) {
                  return dispatch({
                    type: 'remove-active-filter',
                    data: { fields: ['to', 'forAccount'] }
                  });
                }
                if (value.startsWith('all/')) {
                  const [, account] = value.split('/');
                  return dispatch({
                    type: 'replace-active-filter',
                    data: {
                      remove: ['forAccount', 'to'],
                      field: 'forAccount',
                      type: 'equals',
                      value: account
                    }
                  });
                } else {
                  return dispatch({
                    type: 'replace-active-filter',
                    data: {
                      remove: ['forAccount', 'to'],
                      field: 'to',
                      type: 'equals',
                      value
                    }
                  });
                }
              }}
              name="filter-recipient"
              compact
              options={recipientValues}
              value={recipientValue || ''}
              basic
              placeholder="all addresses"
            />
          </span>
        </span>
        <span>
          <span styleName="filter-text">and sort by</span>
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
        </span>
        <span styleName="filter-padding">
          <span styleName="filter-text">and order by</span>
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
        </span>
        <Tooltip placement="left" overlay={<span>Syncing mail</span>}>
          <span styleName="loader" data-loading={showLoading}>
            <Spinner shown={showLoading} />
          </span>
        </Tooltip>
      </div>
    );
  }
);

function getRecipientValues(recipients) {
  return recipients.reduce((out, v) => {
    const [to, account, provider] = v;
    const existing = out.find(o => o.value === account);
    if (existing) {
      return [
        ...out.filter(o => o.value !== existing.value),
        {
          ...existing,
          options: [
            ...(existing.options || []),
            {
              value: to,
              label: to || '(none)'
            }
          ]
        }
      ];
    }
    return [
      ...out,
      {
        label: `${account} (${provider})`,
        value: account,
        options: [
          {
            value: `all/${account}`,
            label: `all from (${account})`
          },
          {
            value: to,
            label: to || '(none)'
          }
        ]
      }
    ];
  }, []);
}
