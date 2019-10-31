import React, { useReducer, useEffect, useRef, useCallback } from 'react';
import { Transition } from 'react-transition-group';
import { HotKeys } from 'react-hotkeys';

import MailItem from '../item';

import { getTransitionClasses } from '../../../utils/transition';
import styles from './list.module.scss';

const keyMap = {
  NEXT_ITEM: 'down',
  PREV_ITEM: 'up'
};

const loadReducer = (state = { mail: [] }, action) => {
  if (action.type === 'reset') {
    const merged = action.data.map(m => {
      const exists = state.mail.some(ex => ex.id === m.id && ex.rendered);
      if (exists) {
        return { id: m.id, rendered: true, prerendered: true };
      }
      return m;
    });
    return {
      mail: merged
    };
  }
  if (action.type === 'load-item') {
    return {
      mail: state.mail.map(m =>
        m.id === action.data ? { id: m.id, rendered: true } : m
      )
    };
  }
  return state;
};

function MailList({ mail = [], page }) {
  const tableRef = useRef(null);
  const [state, dispatch] = useReducer(loadReducer, {
    mail: mail.map(m => ({
      id: m
    }))
  });

  useEffect(() => {
    tableRef.current.classList.remove(styles.loaded);
  }, [page]);

  useEffect(() => {
    setTimeout(() => {
      dispatch({
        type: 'reset',
        data: mail.map(m => ({
          id: m
        }))
      });
    }, 200);
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
  const onRender = useCallback(
    id => {
      if (state.mail.some(m => m.id === id && !m.rendered)) {
        dispatch({ type: 'load-item', data: id });
      }
    },
    [dispatch, state.mail]
  );

  // when everything is loaded
  useEffect(() => {
    const rendered = state.mail.filter(m => m.rendered);
    if (rendered.length > 5 || rendered.length === state.mail.length) {
      tableRef.current.classList.add(styles.loaded);
    }
  }, [state.mail]);

  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <table styleName="list" ref={tableRef} data-active={0} aria-live="off">
        <tbody>
          {state.mail.map(({ id, prerendered }, i) => {
            return (
              <Item
                key={id}
                id={id}
                delay={50 * i}
                onRender={onRender}
                prerendered={prerendered}
              />
            );
          })}
        </tbody>
      </table>
    </HotKeys>
  );
}

export default MailList;

const Item = React.memo(({ id, onRender, delay }) => {
  const ref = useRef(null);
  const onLoad = useCallback(() => {
    if (ref) {
      ref.current.classList.add(styles.itemLoaded);
    }
    onRender(id);
  }, [onRender, id]);
  return (
    <Transition mountOnEnter unmountOnExit timeout={0} in={true}>
      {state => (
        <tr
          ref={ref}
          style={{ transitionDelay: `${delay}ms` }}
          className={getTransitionClasses(`item`, state, styles)}
          key={id}
        >
          <MailItem id={id} onLoad={onLoad} />
        </tr>
      )}
    </Transition>
  );
});
