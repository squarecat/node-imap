import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import Modal from '../components/modal';

export const ModalContext = createContext(null);

const defaultOptions = {
  dismissable: true
};

export const ModalProvider = React.memo(({ children }) => {
  const [openState, setOpenState] = useState({ shown: false, data: {} });
  const [state, setState] = useState({
    options: {},
    modal: null
  });
  const previousOpenState = usePrevious(openState);

  const closeModal = useCallback(data => {
    setOpenState({ shown: false, data });
  }, []);

  // after the modal is closed, call the onClose
  // function if one was provided
  useEffect(
    () => {
      if (previousOpenState && previousOpenState.shown && !openState.shown) {
        state.options.onClose && state.options.onClose(openState.data);
      }
    },
    [state.options, openState.shown, openState.data, previousOpenState]
  );

  const openModal = useCallback((modal, options = {}) => {
    const initialShown =
      typeof options.show !== 'undefined' ? options.show : true;
    setState({
      modal,
      options: {
        ...defaultOptions,
        ...options
      }
    });
    setOpenState({ shown: initialShown });
  }, []);

  useEffect(
    () => {
      function closeModalByEsc({ key }) {
        if (state.options.dismissable && key === 'Escape') {
          closeModal();
        }
      }
      document.addEventListener('keyup', closeModalByEsc);
      return () => {
        document.removeEventListener('keyup', closeModalByEsc);
      };
    },
    [closeModal, state.options.dismissable]
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
      <Modal shown={openState.shown} {...state.options}>
        {state.modal}
      </Modal>
    </ModalContext.Provider>
  );
});

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
