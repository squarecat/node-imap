import React, { useMemo, useReducer } from 'react';

import cx from 'classnames';
import spamImg from '../assets/mail-list-illustration-spam.png';
import styles from './sender-image.module.scss';

const iconUrl = process.env.ICON_URL;

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

export default ({ name, domain }) => {
  const [state, dispatch] = useReducer(ImageReducer, {
    loading: true,
    error: null
  });
  const { loading, error } = state;
  const imageUrl = `${iconUrl}/${domain}`;

  const image = useMemo(
    () => {
      const classes = cx('sender-img', {
        [styles.loading]: loading,
        [styles.errored]: error
      });
      return (
        <img
          alt={`${name} logo`}
          src={imageUrl}
          className={classes}
          onLoad={() => dispatch({ type: 'set-loading', data: false })}
          onError={e => dispatch({ type: 'set-error', data: e })}
        />
      );
    },
    [error, loading, name, imageUrl]
  );
  return (
    <>
      {image}
      {error ? (
        <img
          alt="Image of can of spam"
          src={spamImg}
          onLoad={() => dispatch({ type: 'set-loading', data: false })}
          onError={e => dispatch({ type: 'set-error', data: e })}
        />
      ) : null}
    </>
  );
};
