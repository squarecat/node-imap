import React, { useCallback, useState } from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';

import MailItem from '../item';
import { getTransitionClasses } from '../../../utils/transition';
import styles from './list.module.scss';

function MailList({ mail }) {
  const [loading, setLoading] = useState(true);
  const onLoad = useCallback(() => {
    setLoading(false);
  }, []);
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
                    appear: 100 + 50 * i,
                    enter: 100 + 50 * i,
                    exit: 0
                  }}
                  in={!loading}
                  key={id}
                >
                  {state => {
                    const classes = getTransitionClasses('item', state, styles);
                    return (
                      <tr
                        className={classes}
                        style={{ top: 50 + 74 * i }}
                        key={id}
                      >
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
