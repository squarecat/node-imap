import { CloseIcon, LockIcon } from '../icons';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import Button from '../btn';
import LoadingOverlay from '../loading/overlay';
import ReactDOM from 'react-dom';
import { Transition } from 'react-transition-group';
import cx from 'classnames';
import modalStyles from './modal-template.module.scss';

const modalRoot = document.getElementById('modal-root');
const el = document.createElement('div');

const ModalContext = createContext(null);
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
export default ({
  children,
  shown = false,
  fluid = false,
  dismissable = true,
  onClose = () => {},
  wizardComponent = null,
  style
}) => {
  const [isShown, setShown] = useState(false);
  const ref = useRef(null);

  function closeModal() {
    setShown(false);
    onClose();
    // setTimeout(onClose, 500);
  }
  function closeModalByEsc({ key }) {
    if (dismissable && key === 'Escape') {
      closeModal();
    }
  }

  useEffect(() => {
    modalRoot.appendChild(el);
    document.addEventListener('keyup', closeModalByEsc);
    return () => {
      if (!shown) {
        document.removeEventListener('keyup', closeModalByEsc);
      }
    };
  }, []);

  useEffect(
    () => {
      setShown(shown);
    },
    [shown]
  );

  const btnHeight = ref.current
    ? ref.current.offsetTop + ref.current.height
    : 0;

  return ReactDOM.createPortal(
    <ModalContext.Provider value={{ closeModal }}>
      <Transition appear timeout={200} mountOnEnter unmountOnExit in={isShown}>
        {state => {
          const hasStyle = !!modalStyles[`modalContainer-${state}`];
          const classes = cx(modalStyles['modalContainer'], {
            [modalStyles[`modalContainer-${state}`]]: hasStyle,
            fluid
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
      </Transition>
    </ModalContext.Provider>,
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
  onCancel
}) => {
  return (
    <ModalFooter>
      <div styleName="modal-actions">
        <Button disabled={isLoading} secondary compact onClick={onCancel}>
          Cancel
        </Button>
        <Button
          basic
          compact
          type="submit"
          as="button"
          disabled={isDisabled || isLoading}
          onClick={onSave}
        >
          Save
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
        <Button disabled={isLoading} secondary compact onClick={onCancel}>
          Cancel
        </Button>
        <Button
          basic
          compact
          type="submit"
          as="button"
          disabled={isDisabled || isLoading}
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
  const { closeModal } = useContext(ModalContext);
  return (
    <div styleName="modal-wizard-actions" style={style}>
      {showBack ? (
        <span styleName="prev">
          <Button
            disabled={isLoading}
            secondary
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
              closeModal();
            }
          }}
        >
          {nextLabel}
        </Button>
      </span>
    </div>
  );
};

export const ModalCloseIcon = ({ onClose }) => {
  const { closeModal } = useContext(ModalContext);
  return (
    <a
      styleName="close"
      onClick={() => {
        onClose ? onClose() : closeModal();
      }}
    >
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

export const ModalBody = ({ children, compact, loading = false }) => {
  return (
    <div styleName={`modal-body ${compact ? 'compact' : ''}`}>
      <>
        {children}
        {loading ? <LoadingOverlay /> : null}
      </>
    </div>
  );
};
