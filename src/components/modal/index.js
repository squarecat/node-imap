import { CloseIcon, LockIcon } from '../icons';
import React, { useContext, useEffect, useRef } from 'react';

import Button from '../btn';
import LoadingOverlay from '../loading/overlay';
import { ModalContext } from '../../providers/modal-provider';
import ReactDOM from 'react-dom';
import { Transition } from 'react-transition-group';
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

  return ReactDOM.createPortal(
    <Transition appear timeout={200} mountOnEnter unmountOnExit in={shown}>
      {state => {
        const hasStyle = !!modalStyles[`modalContainer-${state}`];
        const classes = cx(modalStyles['modalContainer'], {
          [modalStyles[`modalContainer-${state}`]]: hasStyle
        });
        return (
          <div className={classes} data-modal>
            <div styleName="modal-wizard-wrapper">
              {wizardComponent ? (
                <span style={{ width: style.width, top: btnHeight }}>
                  {wizardComponent}
                </span>
              ) : null}
              <div style={style} styleName="modal" ref={ref}>
                {children}
              </div>
            </div>
          </div>
        );
      }}
    </Transition>,
    el
  );
};

export const ModalFooter = ({ children }) => {
  return <div styleName="modal-footer">{children}</div>;
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
      <div styleName="modal-actions">
        <Button disabled={isLoading} compact onClick={onCancel}>
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
      </div>
    </ModalFooter>
  );
};

export const ModalPaymentSaveAction = ({
  isDisabled,
  isLoading,
  onSave,
  onCancel,
  formToSubmit
}) => {
  return (
    <ModalFooter>
      <div styleName="footer-info">
        <p styleName="secured-by">
          <LockIcon />
          Payments Secured by <a href="https://stripe.com/">Stripe</a>
        </p>
      </div>
      <div styleName="modal-actions">
        <Button disabled={isLoading} compact onClick={onCancel}>
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
          form={formToSubmit}
        >
          Save
        </Button>
      </div>
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
  onCancel = () => {},
  style
}) => {
  const { close } = useContext(ModalContext);
  return (
    <div styleName="modal-wizard-actions" style={style}>
      {showBack ? (
        <span styleName="prev">
          <Button
            disabled={isLoading}
            compact
            onClick={() => {
              if (showBack) onBack();
              else onCancel();
            }}
          >
            Back
          </Button>
        </span>
      ) : null}
      <span styleName="next">
        <Button
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
      </span>
    </div>
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
