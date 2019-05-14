function getDupeKey(from, to) {
  const { fromEmail } = parseFrom(from);
  const { fromEmail: toEmail } = parseFrom(to);
  return `${fromEmail}-${toEmail}`.toLowerCase();
}

const mailReducer = (state = [], action) => {
  switch (action.type) {
    case 'add':
      return [
        ...state,
        { ...action.data, error: !action.data.estimatedSuccess }
      ];
    case 'add-all':
      return [
        ...state,
        ...action.data.map(m => ({
          ...m,
          error: !action.data.estimatedSuccess
        }))
      ];
    case 'set-occurrences': {
      return state.map(mailItem => {
        const dupeKey = getDupeKey(mailItem.from, mailItem.to);
        const occurrences = action.data[dupeKey] || 0;
        return { ...mailItem, occurrences };
      });
    }
    case 'unsubscribe':
      return state.map(email =>
        email.id === action.data ? { ...email, subscribed: null } : email
      );
    case 'unsubscribe-success':
      return state.map(email =>
        email.id === action.data.id
          ? {
              ...email,
              subscribed: false,
              error: false,
              estimatedSuccess: action.data.estimatedSuccess,
              unsubStrategy: action.data.unsubStrategy,
              hasImage: action.data.hasImage
            }
          : email
      );
    case 'unsubscribe-error':
      return state.map(email =>
        email.id === action.data.id
          ? {
              ...email,
              error: true,
              subscribed: null,
              estimatedSuccess: action.data.estimatedSuccess,
              unsubStrategy: action.data.unsubStrategy,
              hasImage: action.data.hasImage
            }
          : email
      );
    case 'unsubscribe-error-resolved':
      return state.map(email =>
        email.id === action.data.id
          ? {
              ...email,
              error: false,
              subscribed: false,
              estimatedSuccess: action.data.success,
              resolved: true
            }
          : email
      );
    case 'clear': {
      return [];
    }
    case 'set-loading': {
      return state.map(email =>
        email.id === action.data.id
          ? { ...email, isLoading: action.data.isLoading }
          : email
      );
    }
    case 'add-ignore': {
      return state.map(email =>
        email.id === action.data.id ? { ...email, ignored: true } : email
      );
    }
    case 'remove-ignore': {
      return state.map(email =>
        email.id === action.data.id ? { ...email, ignored: false } : email
      );
    }
    default:
      return state;
  }
};

function parseFrom(str = '') {
  if (!str) {
    return { fromName: '', fromEmail: '' };
  }
  let fromName;
  let fromEmail;
  if (str.match(/^.*<.*>/)) {
    const [, name, email] = /^(.*)(<.*>)/.exec(str);
    fromName = name;
    fromEmail = email;
  } else if (str.match(/<?.*@/)) {
    const [, name] = /<?(.*)@/.exec(str);
    fromName = name || str;
    fromEmail = str;
  } else {
    fromName = str;
    fromEmail = str;
  }
  return { fromName, fromEmail };
}

export default mailReducer;
