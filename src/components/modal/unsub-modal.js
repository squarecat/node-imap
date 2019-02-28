import './modal.module.scss';

import React, { useEffect, useState } from 'react';

import { ExternalIcon } from '../icons';
import ModalClose from './modal-close';

export default ({ onClose, onSubmit, mail }) => {
  const {
    id: mailId,
    estimatedSuccess,
    image,
    unsubscribeLink,
    unsubscribeMailTo,
    unsubStrategy
  } = mail;
  const error = !estimatedSuccess;
  const [slide, changeSlide] = useState('first');
  const [isShown, setShown] = useState(false);
  const [selected, setSelected] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const onClickNegative = () => changeSlide('negative');
  const onClickPositive = () => {
    if (error) {
      return changeSlide('positive');
    }
    onClickClose();
  };
  const handleKeydown = e => {
    if (e.keyCode === 27 || e.key === 'Escape') {
      onClickClose();
    }
  };
  // on mount
  useEffect(() => {
    setShown(true);
    document.addEventListener('keydown', handleKeydown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);
  const onClickClose = () => {
    setShown(false);
    setTimeout(onClose, 300);
  };
  const onClickSubmit = data => {
    setShown(false);
    setTimeout(() => onSubmit(data), 300);
  };
  const pickSlide = () => {
    if (slide === 'first') {
      return slide1(
        mailId,
        image,
        onClickPositive,
        onClickNegative,
        error,
        unsubStrategy,
        imageLoading,
        setImageLoading
      );
    } else if (slide === 'negative') {
      return slide2({
        type: unsubStrategy,
        link: unsubscribeLink,
        mailTo: unsubscribeMailTo,
        onClickSubmit,
        onClickBack: () => changeSlide('first'),
        selected,
        setSelected
      });
    } else if (slide === 'positive') {
      return slide3(image, onClickSubmit);
    }
  };
  const title = error ? 'Something went wrong...' : 'Successfully unsubscribed';
  return (
    <>
      <div styleName={`modal ${isShown ? 'shown' : ''}`}>
        <ModalClose onClose={onClickClose} />
        <h3>{title}</h3>
        {pickSlide()}
      </div>
      <div styleName={`modal-bg ${isShown ? 'shown' : ''}`} />
    </>
  );
};

function slide1(
  mailId,
  image,
  onClickPositive,
  onClickNegative,
  error,
  unsubStrategy,
  imageLoading,
  setImageLoading
) {
  let lead;
  let timeout = false;
  if (error && !image) {
    lead = `We couldn't tell if we successfully unsubscribed and we got no response from the provider...`;
    timeout = true;
  } else if (error) {
    lead = `We couldn't tell if we successfully unsubscribed, here's the response we
    got:`;
  } else {
    lead = `We unsubscribed you via ${
      unsubStrategy === 'link'
        ? `a URL link here's the response we got;`
        : `sending an unsubscribe email`
    }`;
  }
  let content;
  if (timeout) {
    content = (
      <>
        <div styleName="modal-content">
          <p>{lead}</p>
        </div>
        <div styleName="modal-actions">
          <a styleName="modal-btn" onClick={onClickNegative}>
            Unsubscribe manually
          </a>
        </div>
      </>
    );
  } else if (unsubStrategy === 'link') {
    content = (
      <>
        <div styleName="modal-content">
          <p>{lead}</p>
          <div styleName="unsub-img-container">
            <img
              alt="unsub image"
              styleName={`unsub-img ${
                imageLoading ? 'unsub-img--loading' : ''
              }`}
              src={`/api/mail/image/${mailId}`}
              onLoad={() => setImageLoading(false)}
            />
            {imageLoading ? <div styleName="image-loading" /> : null}
          </div>
          <p>How does it look?</p>
        </div>
        <div styleName="modal-actions">
          <a styleName="modal-btn" onClick={onClickNegative}>
            It didn't work{' '}
            <span styleName="emoji" role="img" aria-label="thumbs-down emoji">
              ️👎
            </span>
          </a>

          <a styleName="modal-btn modal-btn--cta" onClick={onClickPositive}>
            It looks great{' '}
            <span styleName="emoji" role="img" aria-label="thumbs-up emoji">
              ️️👍
            </span>
          </a>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div styleName="modal-content">
          <p>{lead}</p>
          <p>
            If the provider is behaving themselves, then you shouldn't get any
            more subscription emails from them!
          </p>
        </div>
        <div styleName="modal-actions">
          <a styleName="modal-btn modal-btn--cta" onClick={onClickPositive}>
            Awesome!{' '}
            <span styleName="emoji" role="img" aria-label="thumbs up emoji">
              ️👍
            </span>
          </a>
        </div>
      </>
    );
  }
  return (
    <>
      <div>{content}</div>
    </>
  );
}

function slide2({
  type,
  link,
  mailTo,
  onClickSubmit: onSubmit,
  onClickBack,
  selected,
  setSelected
}) {
  let lead;

  if (type === 'link') {
    lead = (
      <span>
        Oh snap! Sorry about that. This one you'll have to do manually. Just
        click or copy the following link to unsubscribe
      </span>
    );
  } else {
    lead = (
      <span>
        Oh snap! Sorry about that. This one you'll have to do manually. This
        particular service only accepts email unsubscribes, just click the
        following link or send an email to the address in order to unsubscribe
      </span>
    );
  }

  return (
    <>
      <div styleName="modal-content">
        <p>{lead}</p>
        <a
          styleName="modal-btn modal-btn--cta manual-unsubscribe-btn"
          target="_"
          href={link}
        >
          Unsubscribe manually
          <ExternalIcon padleft />
        </a>
        <p styleName="unsubscribe-link-alt">
          <span>Or use this link:</span>
          <a styleName="unsubscribe-link" target="_" href={link}>
            {type === 'link' ? link : mailTo}
          </a>
        </p>
        <p>
          Can you tell us what you think went wrong this time? We'll use the
          information to improve our service. Here are some common reasons;
        </p>
        <ul styleName="feedback-options">
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
        <p styleName={`${!selected ? 'hidden' : ''}`}>
          Thanks! Is it okay if we use that image so that next time we don't
          make the same mistake?
        </p>
      </div>
      <div styleName="modal-actions">
        <a
          styleName={`modal-btn modal-btn--secondary modal-btn--cancel`}
          onClick={onClickBack}
        >
          Back
        </a>
        <a
          styleName={`modal-btn modal-btn--secondary ${
            !selected ? 'disabled' : ''
          }`}
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
          styleName={`modal-btn modal-btn--cta ${!selected ? 'disabled' : ''}`}
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
      <div styleName="modal-content">
        <p>
          Awesome! Is it okay if we use that image so that next time we don't
          make the same mistake?
        </p>
      </div>
      <div styleName="modal-actions">
        <a
          styleName="modal-btn modal-btn--secondary"
          onClick={() => onSubmit({ success: true, useImage: false })}
        >
          Nope
        </a>
        <a
          styleName="modal-btn modal-btn--secondary"
          onClick={() => onSubmit({ success: true, useImage: true })}
        >
          Yes of course!
        </a>
      </div>
    </>
  );
}
