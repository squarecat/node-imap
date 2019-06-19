import { CloseIcon, LockIcon } from '../icons';
import React, { useContext, useEffect, useMemo, useRef } from 'react';

import Button from '../btn';
import LoadingOverlay from '../loading/overlay';
import { ModalContext } from '../../providers/modal-provider';
import ReactDOM from 'react-dom';
import { Transition } from 'react-transition-group';
import _capitalize from 'lodash.capitalize';
import cx from 'classnames';
import modalStyles from './modal-template.module.scss';

const modalRoot = document.getElementById('modal-root');
const el = document.createElement('div');

/**
 * Modal component
 * @param children React node contents
 * @param shown is the modal shown or not
 * @param onClose function called when the modal is closed manually
 *
 * eg.
 * <Modal shown={isModalShown} onClose={() => toggleModal(false)}>
 *    Modal Content
 * </Button>
 *
 */
export default ({ children, shown = false, wizardComponent = null, style }) => {
  const ref = useRef(null);

  const btnHeight = ref.current
    ? ref.current.offsetTop + ref.current.height
    : 0;

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
              [modalStyles[`modalContainer${stateClass}`]]: hasStyle
            });
            return (
              <div className={classes} data-modal>
                <div styleName="modal-wizard-wrapper">
                  {/* {wizardComponent ? (
                    <span style={{ width: style.width, top: btnHeight }}>
                      {wizardComponent}
                    </span>
                  ) : null} */}
                  <div style={style} styleName="modal" ref={ref}>
                    {children}
                  </div>
                </div>
              </div>
            );
          }}
        </Transition>
      );
    },
    [children, shown, style]
  );

  return ReactDOM.createPortal(content, el);
};

export const ModalFooter = ({ children }) => {
  return <div styleName="modal-footer">{children}</div>;
};

export const ModalActions = ({ children }) => {
  return <div styleName="modal-actions">{children}</div>;
};

export const ModalHeader = ({ children }) => {
  return <h3 styleName="modal-header">{children}</h3>;
};

export const ModalSubHeader = ({ children }) => {
  return <h4 styleName="modal-subheader">{children}</h4>;
};

export const ModalSaveAction = ({
  isDisabled,
  isLoading,
  onSave,
  onCancel,
  saveText = 'Save'
}) => {
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
};

export const ModalPaymentSaveAction = ({
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
};

export const ModalWizardActions = ({
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
};

export const ModalCloseIcon = () => {
  const { close } = useContext(ModalContext);
  return (
    <a styleName="close" onClick={close}>
      <CloseIcon width="8" height="8" />
      close
    </a>
  );
};

export const ModalDismissAction = ({ onDismiss, btnText = 'Got it!' }) => {
  return (
    <div styleName="dismiss-footer">
      <Button onClick={onDismiss}>{btnText}</Button>
    </div>
  );
};

export const ModalBody = ({ children, compact = false, loading = false }) => {
  const classes = cx(modalStyles.modalBody, {
    [modalStyles.modalBodyCompact]: compact
  });
  return (
    <div className={classes}>
      <>
        {children}
        {loading ? <LoadingOverlay /> : null}
      </>
    </div>
  );
};
