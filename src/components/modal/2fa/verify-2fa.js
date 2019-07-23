import './2fa.module.scss';

import { FormGroup, FormNotification } from '../../form';
import { ModalBody, ModalFooter, ModalHeader } from '..';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import Button from '../../btn';
import { ModalContext } from '../../../providers/modal-provider';
import TwoFactorInput from '../../2fa';

export default ({ action }) => {
  const [{ isVerified, token }, setVerified] = useState({});
  const { close } = useContext(ModalContext);
  const [isLoading, setLoading] = useState(false);

  const onClickClose = useCallback(
    async () => {
      try {
        if (action && isVerified) {
          await action(token);
        }
        close({ verified: isVerified });
      } catch (err) {
        setVerified({ isVerified: false });
      }
    },
    [action, close, isVerified, token]
  );

  useEffect(
    () => {
      if (isVerified) {
        onClickClose();
      }
    },
    [isVerified, onClickClose]
  );

  return (
    <div styleName="two-factor-modal">
      <ModalBody compact>
        <ModalHeader>Two-factor Auth Required</ModalHeader>

        <p>This action requires authentication.</p>
        <p>
          Open your authentication app and enter the code for Leave Me Alone.
        </p>
        <FormGroup>
          <TwoFactorInput
            action={action}
            onComplete={(isVer, { token }) =>
              setVerified({ isVerified: isVer, token })
            }
            onLoading={is2faLoading => setLoading(is2faLoading)}
          />
        </FormGroup>
        {isVerified === false ? (
          <FormNotification error>
            Verification failed. Please check you have entered the correct code
          </FormNotification>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button compact muted outlined basic onClick={onClickClose}>
          Cancel
        </Button>
        <Button
          compact
          basic
          loading={isLoading}
          disabled={!isVerified}
          onClick={() => close({ verified: isVerified })}
        >
          Confirm
        </Button>
      </ModalFooter>
    </div>
  );
};
