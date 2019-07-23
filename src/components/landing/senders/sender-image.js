import React, { useMemo, useState } from 'react';

import cx from 'classnames';
import spamImg from '../../../assets/mail-list-illustration-spam.png';
import styles from './sender-image.module.scss';

const iconUrl = process.env.ICON_URL;

export default ({ name, domain }) => {
  const [error, setError] = useState(false);

  const image = useMemo(
    () => {
      const classes = cx('sender-img', {
        [styles.errored]: error
      });
      return (
        <img
          alt={`${name} logo`}
          src={`${iconUrl}/${domain}`}
          className={classes}
          onError={() => setError(true)}
        />
      );
    },
    [error, name, domain]
  );
  return (
    <>
      {image}
      {error ? <img alt="Image of can of spam" src={spamImg} /> : null}
    </>
  );
};
