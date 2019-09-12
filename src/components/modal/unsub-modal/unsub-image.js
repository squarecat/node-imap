import React, { useMemo, useReducer } from 'react';

import Browser from '../../browser';
import Pulse from '../../loading/pulse';
import cx from 'classnames';
import styles from './unsub-image.module.scss';

const ImageReducer = (state, action) => {
  const { type, data } = action;
  if (type === 'set-loading') {
    return {
      ...state,
      loading: data
    };
  }
  if (type === 'set-error') {
    return {
      ...state,
      loading: false,
      error: data
    };
  }
  return state;
};
export default React.memo(({ mailId }) => {
  const [state, dispatch] = useReducer(ImageReducer, {
    loading: true,
    error: null
  });
  const { loading, error } = state;
  const image = useMemo(() => {
    const classes = cx(styles['unsub-img'], {
      [styles.imgloading]: loading,
      [styles.imgerrored]: error
    });
    return (
      <img
        alt="Screenshot of the page response after unsubscribing"
        className={classes}
        src={`/api/mail/image/${mailId}`}
        onLoad={() => dispatch({ type: 'set-loading', data: false })}
        onError={e => dispatch({ type: 'set-error', data: e })}
      />
    );
  }, [error, loading, mailId]);

  const containerClasses = cx(styles['container'], {
    [styles.loading]: loading,
    [styles.errored]: error
  });

  return (
    <div className={containerClasses}>
      <Browser>
        {image}
        {loading ? <Pulse /> : null}
        {error ? (
          <div styleName="image-error">
            <p>
              Sorry we couldn't load this image, it could be that the
              unsubscribe page wouldn't load or something went wrong with the
              unsubscribe.
            </p>
          </div>
        ) : null}
      </Browser>
    </div>
  );
});
