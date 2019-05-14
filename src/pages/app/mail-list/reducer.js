export const initialState = {
  mail: []
};

// mail reducer syncs everything with indexdb
const mailReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case 'intial-load': {
      newState = {
        mail: action.data
      };
      break;
    }
    default:
      newState = state;
  }
  return newState;
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

function getDupeKey(from, to) {
  const { fromEmail } = parseFrom(from);
  const { fromEmail: toEmail } = parseFrom(to);
  return `${fromEmail}-${toEmail}`.toLowerCase();
}

export default mailReducer;
