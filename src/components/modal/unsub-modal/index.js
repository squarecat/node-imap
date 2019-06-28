import { ModalBody, ModalCloseIcon, ModalFooter, ModalHeader } from '..';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import Button from '../../btn';
import { ExternalIcon } from '../../icons';
import { ModalContext } from '../../../providers/modal-provider';
import { TextImportant } from '../../text';
import styles from './unsub.module.scss';

const UnsubModal = ({ onSubmit, mail }) => {
  const error = !mail.estimatedSuccess;
  const { close } = useContext(ModalContext);
  const [slide, changeSlide] = useState('first');
  const [selected, setSelected] = useState(null);
  const [imageLoading, setImageLoading] = useState(mail.hasImage);

  const onClickSubmit = useCallback(
    details => {
      onSubmit(details);
      close();
    },
    [close, onSubmit]
  );
  const slideContent = useMemo(
    () => {
      const onClickPositive = () => {
        if (error && !mail.resolved) {
          return changeSlide('positive');
        }
        close();
      };
      const onClickNegative = () => changeSlide('negative');
      const title = error
        ? 'Something went wrong...'
        : 'Successfully unsubscribed';
      const {
        id: mailId,
        hasImage,
        unsubscribeLink,
        unsubscribeMailTo,
        unsubStrategy,
        resolved
      } = mail;
      if (slide === 'first') {
        return slide1(
          mailId,
          onClickPositive,
          onClickNegative,
          error,
          hasImage,
          unsubStrategy,
          resolved,
          imageLoading,
          setImageLoading,
          title
        );
      } else if (slide === 'negative') {
        return slide2({
          type: unsubStrategy,
          link: unsubscribeLink,
          mailTo: unsubscribeMailTo,
          onSubmit: onClickSubmit,
          onClickBack: () => changeSlide('first'),
          selected,
          setSelected,
          hasImage,
          title
        });
      } else if (slide === 'positive') {
        return slide3(onClickSubmit, title);
      }
    },
    [close, error, imageLoading, mail, onClickSubmit, selected, slide]
  );
  return <div styleName="unsub-modal">{slideContent}</div>;
};

function slide1(
  mailId,
  onClickPositive,
  onClickNegative,
  error,
  hasImage,
  unsubStrategy,
  resolved,
  imageLoading,
  setImageLoading,
  title
) {
  let lead;
  let timeout = false;
  if (resolved) {
    lead = null;
  } else if (error && !hasImage) {
    lead = (
      <>
        <p>
          We couldn't tell if we successfully unsubscribed and we got no
          response from the provider...
        </p>
        <p>This has not cost you any credits.</p>
      </>
    );
    timeout = true;
  } else if (error) {
    lead = (
      <p>
        We couldn't tell if we successfully unsubscribed, here's the response we
        got:
      </p>
    );
  } else {
    lead = (
      <p>
        We unsubscribed you via
        {unsubStrategy === 'link'
          ? ` URL link here's the response we got;`
          : `sending an unsubscribe email.`}
      </p>
    );
  }
  let content;
  if (timeout) {
    content = (
      <>
        <ModalBody compact>
          <ModalHeader>
            {title}
            <ModalCloseIcon />
          </ModalHeader>
          {lead}
        </ModalBody>
        <ModalFooter>
          <Button compact basic onClick={onClickNegative}>
            Unsubscribe manually
          </Button>
        </ModalFooter>
      </>
    );
  } else if (unsubStrategy === 'link') {
    let actions = null;
    if (resolved) {
      actions = (
        <Button compact basic onClick={onClickPositive}>
          Awesome!{' '}
          <span styleName="emoji" role="img" aria-label="thumbs up emoji">
            ️👍
          </span>
        </Button>
      );
    } else {
      actions = (
        <>
          <Button compact inline basic onClick={onClickNegative}>
            It didn't work{' '}
            <span styleName="emoji" role="img" aria-label="thumbs-down emoji">
              ️👎
            </span>
          </Button>

          <Button compact basic onClick={onClickPositive}>
            It looks great{' '}
            <span styleName="emoji" role="img" aria-label="thumbs-up emoji">
              ️️👍
            </span>
          </Button>
        </>
      );
    }
    content = (
      <>
        <ModalBody compact>
          <ModalHeader>
            {title}
            <ModalCloseIcon />
          </ModalHeader>
          {lead}
          {hasImage || imageLoading ? (
            <div styleName="unsub-img-container">
              <>
                <img
                  alt="Screenshot of the page response after unsubscribing"
                  styleName={`unsub-img ${
                    imageLoading ? 'unsub-img--loading' : ''
                  }`}
                  src={`/api/mail/image/${mailId}`}
                  onLoad={() => setImageLoading(false)}
                />
                {imageLoading ? <div styleName="image-loading" /> : null}
              </>
            </div>
          ) : null}
          {resolved ? (
            <p>
              You have already let us know this unsubscribe was{' '}
              <TextImportant>
                {error ? 'unsuccessful' : 'successful'}
              </TextImportant>
              , and you unsubscribed manually.
            </p>
          ) : (
            <p>How does it look?</p>
          )}
          {error ? <p>This did not cost you any credits.</p> : null}
        </ModalBody>
        <ModalFooter>{actions}</ModalFooter>
      </>
    );
  } else {
    content = (
      <>
        <ModalBody compact>
          <ModalHeader>
            {title}
            <ModalCloseIcon />
          </ModalHeader>
          <p>{lead}</p>
          <p>
            If the provider is behaving themselves, then you shouldn't get any
            more subscription emails from them!
          </p>
        </ModalBody>
        <ModalFooter>
          <Button basic compact onClick={onClickPositive}>
            Awesome!{' '}
            <span styleName="emoji" role="img" aria-label="thumbs up emoji">
              ️👍
            </span>
          </Button>
        </ModalFooter>
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
  onSubmit,
  onClickBack,
  selected,
  setSelected,
  hasImage
}) {
  let lead;
  let actions;

  if (type === 'link') {
    lead = (
      <span>
        Oh snap! Sorry about that. This one you'll have to do manually. Just
        click or copy the following link to unsubscribe:
      </span>
    );
  } else {
    lead = (
      <span>
        Oh snap! Sorry about that. This one you'll have to do manually. This
        particular service only accepts email unsubscribes, just click the
        following link or send an email to the address in order to unsubscribe:
      </span>
    );
  }

  if (hasImage) {
    actions = (
      <>
        <Button
          basic
          compact
          onClick={() =>
            onSubmit({
              success: false,
              useImage: false,
              failReason: selected
            })
          }
        >
          Nope
        </Button>
        <Button
          disabled={!selected}
          compact
          basic
          onClick={() =>
            onSubmit({
              success: false,
              useImage: true,
              failReason: selected
            })
          }
        >
          Yes of course!
        </Button>
      </>
    );
  } else {
    actions = (
      <Button
        disabled={!selected}
        compact
        basic
        onClick={() =>
          onSubmit({
            success: false,
            useImage: false,
            failReason: selected
          })
        }
      >
        Submit
      </Button>
    );
  }

  return (
    <>
      <ModalBody compact>
        <p>{lead}</p>
        <a
          styleName="manual-unsubscribe-btn"
          target="_"
          href={type === 'link' ? link : mailTo}
        >
          Unsubscribe manually
          <ExternalIcon padleft />
        </a>
        <p styleName="unsubscribe-link-alt">
          <span>Or use this link:</span>
          <a
            styleName="unsubscribe-link"
            target="_"
            href={type === 'link' ? link : mailTo}
          >
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
        <p className={!selected ? styles.hidden : ''}>
          Thanks!{' '}
          {hasImage
            ? "Is it okay if we use that image so that next time we don't make the same mistake?"
            : ''}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button basic compact muted outlined onClick={onClickBack}>
          Back
        </Button>
        {actions}
      </ModalFooter>
    </>
  );
}

function slide3(onSubmit) {
  return (
    <>
      <ModalBody compact>
        <p>
          Awesome! Is it okay if we use that image so that next time we don't
          make the same mistake?
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          basic
          compact
          onClick={() => onSubmit({ success: true, useImage: false })}
        >
          Nope
        </Button>
        <Button
          basic
          compact
          onClick={() => onSubmit({ success: true, useImage: true })}
        >
          Yes of course!
        </Button>
      </ModalFooter>
    </>
  );
}

export default UnsubModal;
