import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import Modal from '../components/modal';
import { useClickAway } from 'react-use';

export const ModalContext = createContext(null);

const defaultOptions = {
  dismissable: true
};

export const ModalProvider = ({ children }) => {
  const modalRef = useRef(null);

  const [state, setState] = useState({
    shown: false,
    options: {},
    modal: null
  });
  const { options, shown, modal } = state;

  const closeModal = useCallback(
    data => {
      if (shown) {
        setState({ options, modal, shown: false });
      }
      options.onClose && options.onClose(data);
    },
    [modal, options, shown]
  );

  const openModal = useCallback((modal, options = {}) => {
    const shown = typeof options.show !== 'undefined' ? options.show : true;
    setState({
      modal,
      options: {
        ...defaultOptions,
        ...options
      },
      shown
    });
  }, []);

  useEffect(
    () => {
      function closeModalByEsc({ key }) {
        if (options.dismissable && key === 'Escape') {
          closeModal();
        }
      }
      document.addEventListener('keyup', closeModalByEsc);
      return () => {
        document.removeEventListener('keyup', closeModalByEsc);
      };
    },
    [closeModal, options.dismissable]
  );

  // useClickAway(
  //   modalRef,
  //   () => {
  //     const { options } = state;
  //     if (options.dismissable) {
  //       closeModal();
  //     }
  //   },
  //   [state, closeModal]
  // );

  return (
    <ModalContext.Provider
      value={{
        open: openModal,
        close: closeModal
      }}
    >
      {children}
      <Modal shown={state.shown} {...state.options}>
        {modal}
      </Modal>
    </ModalContext.Provider>
  );
};
