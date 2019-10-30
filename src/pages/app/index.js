import 'isomorphic-fetch';

import MailList from '../../app/mail-list';
import React from 'react';
import Template from '../../app/template';
import { Transition } from 'react-transition-group';

if (process.env.NODE_ENV !== 'production') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React);
}

function Content() {
  return (
    <>
      <Transition
        in={true}
        classNames="mail-list-content"
        timeout={250}
        mountOnEnter
        appear
      >
        {state => (
          <div className={`mail-list-content ${state}`}>
            <MailList />
          </div>
        )}
      </Transition>
    </>
  );
}

export default function App({ location }) {
  const { showLoading } = location.state ? location.state : {};
  return (
    <Template showLoading={showLoading}>
      <Content />
    </Template>
  );
}
