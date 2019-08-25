import { CloseIcon, LockIcon } from '../icons';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock';

import Button from '../btn';
import LoadingOverlay from '../loading/overlay';
import { ModalContext } from '../../providers/modal-provider';
import ReactDOM from 'react-dom';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import cx from 'classnames';
import modalStyles from './modal-template.module.scss';

let el;
let modalRoot;

if (typeof window !== 'undefined') {
  modalRoot = window.document.getElementById('modal-root');
  el = window.document.createElement('div');
}
/**
 * Modal component
 * @param children React node contents
 * @param shown is the modal shown or not
 *
 * eg.
 * <Modal shown={isModalShown}>
 *    Modal Content
 * </Button>
 *
 */
export default React.memo(({ children, opaque, shown = false, style }) => {
  const ref = useRef(null);

  useEffect(() => {
    modalRoot.appendChild(el);
  }, []);

  const content = useMemo(
    () => {
      if (!children) {
        return null;
      }
      return (
        <Transition
          component={null}
          appear
          timeout={100}
          mountOnEnter
          unmountOnExit
          in={shown}
        >
          {state => {
            const stateClass = _capitalize(state);
            const hasStyle = !!modalStyles[`modalContainer${stateClass}`];
            const classes = cx(modalStyles['modalContainer'], {
              [modalStyles[`modalContainer${stateClass}`]]: hasStyle,
              [modalStyles.opaque]: opaque
            });
            return (
              <div className={classes} data-modal>
                <div styleName="modal-wizard-wrapper" data-modal-wrapper>
                  <div
                    style={style}
                    styleName="modal"
                    ref={ref}
                    data-modal-content
                  >
                    {children}
                  </div>
                </div>
              </div>
            );
          }}
        </Transition>
      );
    },
    [children, opaque, shown, style]
  );

  if (el) {
    return ReactDOM.createPortal(content, el);
  }
  return content;
});

export const ModalFooter = React.memo(({ children }) => {
  return <div styleName="modal-footer">{children}</div>;
});

export const ModalActions = React.memo(({ children }) => {
  return <div styleName="modal-actions">{children}</div>;
});

export const ModalHeader = React.memo(({ children }) => {
  return <h3 styleName="modal-header">{children}</h3>;
});

export const ModalSubHeader = React.memo(({ children }) => {
  return <h4 styleName="modal-subheader">{children}</h4>;
});

export const ModalSaveAction = React.memo(
  ({ isDisabled, isLoading, onSave, onCancel, saveText = 'Save' }) => {
    return (
      <ModalFooter>
        <ModalActions>
          <Button
            disabled={isLoading}
            basic
            muted
            outlined
            compact
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            basic
            compact
            stretch
            type="submit"
            as="button"
            disabled={isDisabled || isLoading}
            loading={isLoading}
            onClick={onSave}
          >
            {saveText}
          </Button>
        </ModalActions>
      </ModalFooter>
    );
  }
);

export const ModalPaymentSaveAction = React.memo(
  ({
    isDisabled,
    isLoading,
    onSave,
    onCancel,
    cancelText = 'Cancel',
    saveText = 'Save'
  }) => {
    return (
      <ModalFooter>
        <div styleName="footer-info">
          <p styleName="secured-by">
            <LockIcon />
            Payments Secured by <a href="https://stripe.com/">Stripe</a>
          </p>
        </div>
        <ModalActions>
          <Button basic muted disabled={isLoading} compact onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            basic
            compact
            stretch
            type="submit"
            as="button"
            disabled={isDisabled || isLoading}
            loading={isLoading}
            onClick={onSave}
          >
            {saveText}
          </Button>
        </ModalActions>
      </ModalFooter>
    );
  }
);

export const ModalWizardActions = React.memo(
  ({
    isLoading = false,
    isNextDisabled = false,
    showBack = true,
    nextLabel = 'Next',
    onNext = () => {},
    onBack = () => {},
    onCancel = () => {}
  }) => {
    const { close } = useContext(ModalContext);
    return (
      <ModalFooter>
        {showBack ? (
          <Button
            disabled={isLoading}
            compact
            basic
            muted
            onClick={() => {
              if (showBack) onBack();
              else onCancel();
            }}
          >
            Back
          </Button>
        ) : null}

        <Button
          basic
          compact
          disabled={isNextDisabled || isLoading}
          onClick={async () => {
            const hasNextPage = await onNext();
            if (hasNextPage === false) {
              close();
            }
          }}
        >
          {nextLabel}
        </Button>
      </ModalFooter>
    );
  }
);

export const ModalCloseIcon = React.memo(() => {
  const { close } = useContext(ModalContext);
  return (
    <a styleName="close" onClick={close}>
      <CloseIcon width="8" height="8" />
      close
    </a>
  );
});

export const ModalDismissAction = React.memo(
  ({ onDismiss, btnText = 'Got it!' }) => {
    return (
      <div styleName="dismiss-footer">
        <Button onClick={onDismiss}>{btnText}</Button>
      </div>
    );
  }
);

export const ModalBody = React.memo(
  ({ children, compact = false, loading = false }) => {
    const { isShown } = useContext(ModalContext);
    const bodyRef = useRef(null);

    useEffect(
      () => {
        disableBodyScroll(bodyRef.current);

        return function cleanup() {
          clearAllBodyScrollLocks();
        };
      },
      [isShown]
    );

    const classes = cx(modalStyles.modalBody, {
      [modalStyles.modalBodyCompact]: compact
    });

    return (
      <div className={classes} ref={bodyRef}>
        <>
          {children}
          {loading ? <LoadingOverlay /> : null}
        </>
      </div>
    );
  }
);
