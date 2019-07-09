import React, { useCallback, useMemo, useState } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

import MailItem from '../item';
import _after from 'lodash.after';
import { getTransitionClasses } from '../../../utils/transition';
import styles from './list.module.scss';

function MailList({ mail }) {
  const [loading, setLoading] = useState(true);

  const setLoad = useCallback(
    () => {
      if (loading) {
        setLoading(false);
      }
    },
    [loading]
  );
  const onLoad = useMemo(
    () => {
      return _after(mail.length, setLoad);
    },
    [mail, setLoad]
  );
  return (
    <>
      <table styleName="list">
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
    </>
  );
}

export default MailList;
