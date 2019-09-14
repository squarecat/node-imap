import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer
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
        options: {
          ...state.options,
          ...state.prevOptions
        },
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

  const closeModal = useCallback(data => {
    dispatch({ type: 'close', data });
  }, []);

  const openModal = useCallback((modal, options = {}) => {
    const initialShown =
      typeof options.show !== 'undefined' ? options.show : true;
    dispatch({
      type: 'open',
      data: { shown: initialShown, modal, options }
    });
  }, []);

  const replaceModal = useCallback((modal, options = {}) => {
    dispatch({ type: 'replace', data: { modal, options } });
  }, []);

  useEffect(() => {
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
  }, [closeModal, state.options.dismissable, state.shown]);

  useEffect(() => {
    if (state.shown) {
      hideScrollbars();
    } else {
      showScrollbars();
    }
  }, [state.shown]);
  const value = useMemo(
    () => ({
      open: openModal,
      close: closeModal,
      replace: replaceModal,
      isShown: state.shown,
      context: state.options.context
    }),
    [closeModal, openModal, replaceModal, state.shown, state.options.context]
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

function hideScrollbars() {
  const top = document.documentElement.scrollTop;
  document.documentElement.style.scrollBehavior = 'unset';
  document.body.classList.add('no-scroll');
  document.body.scrollTop = top;
  document.body.setAttribute('data-scroll', top);
}
function showScrollbars() {
  const top = document.body.getAttribute('data-scroll');
  document.body.removeAttribute('data-scroll');
  document.body.classList.remove('no-scroll');
  document.documentElement.scrollTop = top;
  document.documentElement.style.scrollBehavior = 'smooth';
}
