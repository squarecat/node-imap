import './success.module.scss';

import {
  ModalActions,
  ModalBody,
  ModalCloseIcon,
  ModalFooter,
  ModalHeader
} from '..';
import React, { useContext } from 'react';

import Button from '../../btn';
import { ModalContext } from '../../../providers/modal-provider';
import PlanImage from '../../pricing/plan-image';
import { TextImportant } from '../../text';

export default function StartPurchase({ credits }) {
  const { close: closeModal } = useContext(ModalContext);
  return (
    <>
      <ModalBody compact>
        <ModalHeader>
          Payment Successful
          <ModalCloseIcon />
        </ModalHeader>
        <div styleName="billing-success">
          <PlanImage type="package" />
          <p>
            You now have <TextImportant>{credits}</TextImportant> more
            unsubscribe credits!
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <ModalActions>
          <Button compact basic muted onClick={() => closeModal()}>
            Close
          </Button>
          <Button
            as="link"
            linkTo="/app"
            compact
            basic
            onClick={() => closeModal()}
          >
            Go to scan
          </Button>
        </ModalActions>
      </ModalFooter>
    </>
  );
}
