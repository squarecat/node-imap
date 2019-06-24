import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import Modal from '../components/modal';

export const ModalContext = createContext(null);

const defaultOptions = {
  dismissable: true
};

export const ModalProvider = ({ children }) => {
  const [state, setState] = useState({
    shown: false,
    options: {},
    modal: null
  });
  const { options, modal } = state;

  const closeModal = useCallback(
    data => {
      setState({ options, modal, shown: false });
      options.onClose && options.onClose(data);
    },
    [modal, options]
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

  const value = useMemo(
    () => ({
      open: openModal,
      close: closeModal
    }),
    [closeModal, openModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal shown={state.shown} {...state.options}>
        {modal}
      </Modal>
    </ModalContext.Provider>
  );
};
