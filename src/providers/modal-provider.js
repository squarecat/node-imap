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

function Provider({ children }) {
  const modalRef = useRef(null);

  const [state, setState] = useState({
    shown: false,
    options: {},
    modal: null
  });

  const closeModal = useCallback(
    () => {
      const { shown, options } = state;
      if (shown) {
        setState({ ...state, shown: false });
      }
      options.onClose && options.onClose();
    },
    [state]
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
      const { options } = state;
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
    [state, closeModal]
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
      <Modal ref={modalRef} shown={state.shown} {...state.options}>
        {state.modal}
      </Modal>
    </ModalContext.Provider>
  );
}

export const ModalProvider = Provider;
