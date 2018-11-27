import React, { useState, useEffect } from 'react';
import './modal.css';

export default ({ /*onClose,*/ onSubmit, image, link }) => {
  const [slide, changeSlide] = useState('first');
  const [isShown, setShown] = useState(false);
  const onClickNegative = () => changeSlide('negative');
  const onClickPositive = () => changeSlide('positive');
  // on mount
  useEffect(() => {
    setShown(true);
  }, []);
  // const onClickClose = () => {
  //   setShown(false);
  //   setTimeout(onClose, 300);
  // };
  const onClickSubmit = data => {
    setShown(false);
    setTimeout(() => onSubmit(data), 300);
  };
  const pickSlide = () => {
    if (slide === 'first') {
      return slide1(image, onClickPositive, onClickNegative);
    } else if (slide === 'negative') {
      return slide2(link, onClickSubmit);
    } else if (slide === 'positive') {
      return slide3(image, onClickSubmit);
    }
  };
  return (
    <>
      <div className={`modal error-modal ${isShown ? 'shown' : ''}`}>
        <h3>Something went wrong...</h3>
        {pickSlide()}
      </div>
      <div className={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};

function slide1(image, onClickPositive, onClickNegative) {
  return (
    <>
      <p>
        We couldn't tell if we successfully unsubscribed, here's the response we
        got:
      </p>
      <img alt="unsub image" src={`data:image/jpeg;base64, ${image}`} />
      <p>How does it look?</p>
      <div className="modal-actions">
        <a className="btn muted compact" onClick={onClickNegative}>
          It looks unsuccessful{' '}
          <span className="emoji" role="img" aria-label="frowning face emoji">
            ️️☹️
          </span>
        </a>
        <a className="btn compact" onClick={onClickPositive}>
          It looks great{' '}
          <span className="emoji" role="img" aria-label="thumbs up emoji">
            ️️👍
          </span>
        </a>
      </div>
    </>
  );
}

function slide2(link, onSubmit) {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <p>
        Oh snap! Sorry about that. This one you'll have to do manually. Just
        click or copy the following link to unsubscribe;
      </p>
      <p>
        <a className="unsubscribe-link" href={link}>
          {link}
        </a>
      </p>
      <p>
        Can you tell us what you think went wrong this time? We'll use the
        information to improve our service. Here are some common reasons;
      </p>
      <ul className="feedback-options">
        <li
          onClick={() => setSelected('button')}
          data-selected={selected === 'button'}
        >
          There was a submit button that needed to be clicked
        </li>
        <li
          onClick={() => setSelected('steps')}
          data-selected={selected === 'steps'}
        >
          There were extra steps to unsubscribe
        </li>
        <li
          onClick={() => setSelected('login')}
          data-selected={selected === 'login'}
        >
          I had to login
        </li>
        <li
          onClick={() => setSelected('404')}
          data-selected={selected === '404'}
        >
          The link didn't work
        </li>
        <li
          onClick={() => setSelected('other')}
          data-selected={selected === 'other'}
        >
          Other
        </li>
      </ul>
      <p className={`${!selected ? 'hidden' : ''}`}>
        Thanks! Is it okay if we use that image so that next time we don't make
        the same mistake?
      </p>
      <div className="modal-actions">
        <a
          className={`btn muted compact ${!selected ? 'disabled' : ''}`}
          onClick={() =>
            onSubmit({
              success: false,
              useImage: false,
              failReason: selected
            })
          }
        >
          Nope
        </a>
        <a
          className={`btn compact ${!selected ? 'disabled' : ''}`}
          onClick={() =>
            onSubmit({
              success: false,
              useImage: true,
              failReason: selected
            })
          }
        >
          Yes of course!
        </a>
      </div>
    </>
  );
}

function slide3(image, onSubmit) {
  return (
    <>
      <p>
        Awesome! Is it okay if we use that image so that next time we don't make
        the same mistake?
      </p>
      <div className="modal-actions">
        <a
          className="btn muted compact"
          onClick={() => onSubmit({ success: true, useImage: false })}
        >
          Nope
        </a>
        <a
          className="btn compact"
          onClick={() => onSubmit({ success: true, useImage: true })}
        >
          Yes of course!
        </a>
      </div>
    </>
  );
}
