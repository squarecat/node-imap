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
  const previousModalState = usePrevious(state);

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

  const closeModal = useCallback(
    data => {
      if (state.options.replaced) {
        setState({ ...previousModalState, context: state.options.context });
      } else {
        setOpenState({ shown: false, data });
      }
    },
    [state.options.context, state.options.replaced]
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

  const replaceModal = useCallback(
    (modal, options = {}) => {
      const modalIsAlreadyOpen = openState.shown;
      openModal(modal, {
        ...options,
        show: true,
        replaced: modalIsAlreadyOpen
      });
    },
    [openModal, openState.shown]
  );

  useEffect(
    () => {
      function closeModalByEsc({ key }) {
        if (state.options.dismissable && key === 'Escape') {
          closeModal();
        }
      }
      function closeModalByClickAway({ target }) {
        if (state.options.dismissable) {
          let t = target;
          while (t && t.getAttribute('data-modal-content')) {
            if (t === document.body) {
              return closeModal();
            }
            t = t.parentElement;
          }
        }
      }
      function removeListeners() {
        document.removeEventListener('keyup', closeModalByEsc);
        document.removeEventListener('click', closeModalByClickAway);
      }
      if (openState.shown) {
        document.addEventListener('keyup', closeModalByEsc);
        document.addEventListener('click', closeModalByClickAway);
      } else {
        removeListeners();
      }
      return () => removeListeners();
    },
    [closeModal, openState.shown, state.options.dismissable]
  );

  const value = useMemo(
    () => ({
      open: openModal,
      close: closeModal,
      replace: replaceModal,
      context: state.context
    }),
    [closeModal, openModal, replaceModal, state.context]
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
