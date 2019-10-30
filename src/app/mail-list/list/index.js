import React, { useReducer, useEffect, useRef, useCallback } from 'react';

import { HotKeys } from 'react-hotkeys';

import MailItem from '../item';

import { getTransitionClasses } from '../../../utils/transition';
import styles from './list.module.scss';

const keyMap = {
  NEXT_ITEM: 'down',
  PREV_ITEM: 'up'
};

const loadReducer = (state, action) => {
  if (action.type === 'reset') {
    return {
      finished: false,
      loadedItems: 0,
      totalItems: action.data
    };
  }
  if (action.type === 'load-item') {
    const loadedItems = state.loadedItems + 1;
    return {
      ...state,
      loadedItems,
      finished: loadedItems === state.totalItems
    };
  }
  return state;
};

function MailList({ mail }) {
  const tableRef = useRef(null);
  const [loadedState, dispatch] = useReducer(loadReducer, {
    finished: false,
    itemCount: 0,
    totalItems: mail.length
  });

  useEffect(() => {
    dispatch({ type: 'reset', data: mail.length });
  }, [mail]);

  const handlers = {
    NEXT_ITEM: e => {
      if (!tableRef.current) return;
      const current = +tableRef.current.getAttribute('data-active');
      if (current + 1 > 20) {
        return;
      }
      if (current > 0) {
        tableRef.current
          .querySelector(`tr[data-active]`)
          .removeAttribute('data-active');
      }
      const tr = tableRef.current.querySelector(`tr:nth-child(${current + 1})`);
      tr.setAttribute('data-active', true);

      if (
        current > 5 &&
        tr.offsetTop + window.scrollY > window.innerHeight - 320 &&
        tr.offsetTop - window.scrollY > 320
      ) {
        const scroll = tr.offsetTop - window.innerHeight + 320;
        window.scrollTo(0, scroll);
        console.log('scroll because of nav change');
      }
      tableRef.current.setAttribute('data-active', current + 1);
      tr.querySelector('[data-focus] > div').focus();
      e.preventDefault();
    },
    PREV_ITEM: e => {
      if (!tableRef.current) return;
      const current = +tableRef.current.getAttribute('data-active');
      if (current - 1 === 0) {
        return;
      }
      if (current > 0) {
        tableRef.current
          .querySelector(`tr[data-active]`)
          .removeAttribute('data-active');
      }
      const tr = tableRef.current.querySelector(`tr:nth-child(${current - 1})`);
      tr.setAttribute('data-active', true);
      tableRef.current.setAttribute('data-active', current - 1);
      if (current < 15 && tr.offsetTop - window.scrollY < 320) {
        const scroll = tr.offsetTop - 320;
        window.scrollTo(0, scroll);
      }
      tr.querySelector('[data-focus] > div').focus();
      e.preventDefault();
    }
  };

  const onLoad = useCallback(() => {
    dispatch({ type: 'load-item' });
  }, [dispatch]);

  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <table styleName="list" ref={tableRef} data-active={0} aria-live="off">
        <tbody>
          {mail.map((id, i) => {
            const state = loadedState.finished ? 'entered' : 'exited';
            const classes = getTransitionClasses('item', state, styles);
            return (
              <tr
                style={{ transitionDelay: `${50 * i}ms` }}
                className={classes}
                key={id}
              >
                <MailItem id={id} onLoad={onLoad} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </HotKeys>
  );
}

export default MailList;
