import React, { useEffect, useReducer, useState } from 'react';
import { useGlobal } from 'reactn';
import io from 'socket.io-client';

import './mail-list.css';

const mailReducer = (state, action) => {
  switch (action.type) {
    case 'add':
      return [...state, action.data];
    case 'unsubscribe':
      return state.map(email =>
        email.id === action.data ? { ...email, subscribed: null } : email
      );
    case 'unsubscribe-success':
      return state.map(email =>
        email.id === action.data.id
          ? { ...email, subscribed: false, image: action.data.image }
          : email
      );
    case 'unsubscribe-error':
      return state.map(email =>
        email.id === action.data.id
          ? {
              ...email,
              error: true,
              subscribed: null,
              image: action.data.image
            }
          : email
      );
    default:
      return state;
  }
};

function useSocket(onFinished) {
  const [user] = useGlobal('user');
  const [mail, dispatch] = useReducer(mailReducer, []);
  // const [isConnected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  // only once
  useEffect(() => {
    const socket = io.connect('http://127.0.0.1:2345/mail');
    socket.on('connect', () => {
      socket.emit('authenticate', { token: user.token, userId: user.id });
    });
    socket.on('authenticated', () => {
      setSocket(socket);
    });
    socket.on('mail', data => {
      console.log(data);
      dispatch({ type: 'add', data: data });
    });
    socket.on('mail:end', onFinished);
    socket.on('mail:err', err => {
      console.error(err);
    });

    socket.on('unsubscribe:success', ({ id, image }) => {
      dispatch({ type: 'unsubscribe-success', data: { id, image } });
    });
    socket.on('unsubscribe:err', ({ id, image }) => {
      dispatch({ type: 'unsubscribe-error', data: { id, image } });
    });
  }, []);

  function fetchMail() {
    if (socket) {
      socket.emit('fetch');
    }
  }
  function unsubscribeMail(mail) {
    if (socket) {
      dispatch({ type: 'unsubscribe', data: mail.id });
      socket.emit('unsubscribe', mail);
    }
  }

  return { mail, fetchMail, unsubscribeMail, isConnected: !!socket, dispatch };
}

export default ({ onFinished }) => {
  const { mail, fetchMail, unsubscribeMail, isConnected } = useSocket(
    onFinished
  );
  useEffect(fetchMail, [isConnected]);
  function unsubscribe(mail) {
    unsubscribeMail(mail);
  }
  return (
    <div className="mail-list">
      <ul>
        {mail.map(m => {
          const [, fromName, fromEmail] = /^(.*)(<.*>)/.exec(m.from);
          return (
            <li key={m.from}>
              <div className="mail-item">
                <div className="avatar" />
                <div className="mail-content">
                  <div className="from">
                    <span className="from-name">{fromName}</span>
                    <span className="from-email">{fromEmail}</span>
                  </div>
                  {/* <div className="to">{m.to}</div> */}
                  <div className="subject">{m.subject}</div>
                </div>
                <div className="actions">
                  <a onClick={() => unsubscribe(m)}>Unsubscribe</a>
                </div>
              </div>
              <span>{m.unsubscribeLink}</span>
              <span>{m.unsubscribeMailTo}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
