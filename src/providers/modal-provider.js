import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react';

import Modal from '../components/modal';

export const ModalContext = createContext(null);

const defaultOptions = {
  dismissable: true
};

const modalReducer = (state, action) => {
  if (action.type === 'open') {
    return {
      ...state,
      shown: true,
      modal: action.data.modal,
      options: {
        ...defaultOptions,
        ...action.data.options
      }
    };
  }
  if (action.type === 'close') {
    if (state.prevModal) {
      return {
        ...state,
        shown: true,
        modal: state.prevModal,
        options: state.prevOptions,
        prevModal: null,
        prevOptions: null
      };
    }
    if (state.options.onClose) {
      state.options.onClose(action.data);
    }
    return {
      ...state,
      shown: false,
      modal: null,
      options: {}
    };
  }
  if (action.type === 'replace') {
    return {
      shown: true,
      ...action.data,
      prevModal: state.modal,
      prevOptions: state.options
    };
  }
  return state;
};

export const ModalProvider = React.memo(({ children }) => {
  const [state, dispatch] = useReducer(modalReducer, {
    modal: null,
    shown: false,
    options: {}
  });
  // const [openState, setOpenState] = useState({ shown: false, data: {} });
  // const [state, setState] = useState({
  //   options: {},
  //   modal: null
  // });
  // const previousOpenState = usePrevious(openState);
  // const previousModalState = usePrevious(state);

  // after the modal is closed, call the onClose
  // function if one was provided
  // useEffect(
  //   () => {
  //     if (previousOpenState && previousOpenState.shown && !openState.shown) {
  //     }
  //   },
  //   [state.options, openState.shown, openState.data, previousOpenState]
  // );

  const closeModal = useCallback(data => {
    dispatch({ type: 'close', data });
  }, []);

  const openModal = useCallback((modal, options = {}) => {
    const initialShown =
      typeof options.show !== 'undefined' ? options.show : true;
    dispatch({ type: 'open', data: { shown: initialShown, modal, options } });
  }, []);

  const replaceModal = useCallback((modal, options = {}) => {
    dispatch({ type: 'replace', data: { modal, options } });
  }, []);

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
      if (state.shown) {
        document.addEventListener('keyup', closeModalByEsc);
        document.addEventListener('click', closeModalByClickAway);
      } else {
        removeListeners();
      }
      return () => removeListeners();
    },
    [closeModal, state.options.dismissable, state.shown]
  );

  const value = useMemo(
    () => ({
      open: openModal,
      close: closeModal,
      replace: replaceModal,
      isShown: state.shown,
      context: state.context
    }),
    [closeModal, openModal, replaceModal, state.shown, state.context]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal shown={state.shown} {...state.options}>
        {state.modal}
      </Modal>
    </ModalContext.Provider>
  );
});
