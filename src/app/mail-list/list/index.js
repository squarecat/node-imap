import React, { useCallback, useMemo, useState, useRef } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';
import { HotKeys } from 'react-hotkeys';

import MailItem from '../item';
import _after from 'lodash.after';
import { getTransitionClasses } from '../../../utils/transition';
import styles from './list.module.scss';

const keyMap = {
  NEXT_ITEM: 'down',
  PREV_ITEM: 'up'
};

function MailList({ mail }) {
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const setLoad = useCallback(() => {
    if (loading) {
      setLoading(false);
    }
  }, [loading]);

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

  const onLoad = useMemo(() => {
    return _after(mail.length, setLoad);
  }, [mail, setLoad]);

  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <table styleName="list" ref={tableRef} data-active={0}>
        <tbody>
          <TransitionGroup component={null}>
            {mail.map((id, i) => {
              return (
                <Transition
                  appear
                  mountOnEnter
                  unmountOnExit
                  timeout={{
                    appear: 50 * i,
                    enter: 50 * i,
                    exit: 0
                  }}
                  in={!loading}
                  key={id}
                >
                  {state => {
                    const classes = getTransitionClasses('item', state, styles);
                    return (
                      <tr className={classes} key={id}>
                        <MailItem id={id} onLoad={onLoad} />
                      </tr>
                    );
                  }}
                </Transition>
              );
            })}
          </TransitionGroup>
        </tbody>
      </table>
    </HotKeys>
  );
}

export default MailList;
