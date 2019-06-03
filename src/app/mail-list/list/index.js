import './list.module.scss';

import React, { useContext, useState } from 'react';

import { MailContext } from '../provider';
import MailItem from '../item';
import UnsubModal from '../../../components/modal/unsub-modal';

function MailList({ mail }) {
  const { actions } = useContext(MailContext);
  const [unsubData, setUnsubData] = useState(null);
  return (
    <>
      <table styleName="list">
        <tbody>
          {mail.map(id => {
            return (
              <tr styleName="item" key={id}>
                <MailItem id={id} setUnsubModal={d => setUnsubData(d)} />
              </tr>
            );
          })}
        </tbody>
      </table>
      {unsubData ? (
        <UnsubModal
          shown={!!unsubData}
          onClose={() => {
            setUnsubData(null);
          }}
          onSubmit={({ success, useImage, failReason = null }) => {
            setUnsubData(null);
            actions.resolveUnsubscribeError({
              success,
              mailId: unsubData.id,
              useImage,
              from: unsubData.from,
              reason: failReason,
              unsubStrategy: unsubData.unsubStrategy
            });
          }}
          mail={unsubData}
        />
      ) : null}
    </>
  );
}

export default MailList;
