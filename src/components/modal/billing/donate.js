import './donate.module.scss';

import { FormCheckbox, FormGroup } from '../../form';
import React, { useContext } from 'react';
import { TextImportant, TextLink } from '../../text';

import { BillingModalContext } from './index';
import numeral from 'numeral';
import treeImg from '../../../assets/climate/tree.png';

// numbers
const EMAILS_SENT_PER_DAY = 246500000000;
const CARBON_PER_EMAIL = 4;
const TONNE_CONVERSION = 1e6;
const TONNES_CARBON_PER_YEAR = numeral(
  (EMAILS_SENT_PER_DAY * CARBON_PER_EMAIL) / TONNE_CONVERSION
).format('0,0');

// links
const TREE_ORG_LINK = 'https://onetreeplanted.org';

export default function Donate() {
  const { state, dispatch } = useContext(BillingModalContext);

  return (
    <>
      <h4>
        Clean your inbox and{' '}
        <TextLink href="/save-the-planet" target="_">
          save the planet
        </TextLink>
        .
      </h4>
      <p>
        Emails contribute to{' '}
        <TextImportant>
          {TONNES_CARBON_PER_YEAR} tonnes of carbon being dumped into the
          atmosphere every year
        </TextImportant>{' '}
        <TextLink undecorated href="/save-the-planet#cite-5">
          <sup>[5]</sup>
        </TextLink>
        .
      </p>
      <p>
        You are already helping by unsubscribing from the ones you do not want.
        Plant a tree to help even more.
      </p>
      <p>
        One dollar plants one tree with our partner{' '}
        <TextLink href={TREE_ORG_LINK} target="_">
          One Tree Planted
        </TextLink>
        . We plant an additional tree for every 10 our customers do!
      </p>
      <div styleName="donate-checkbox">
        <span styleName="tree-img">
          <img alt="deciduous tree in a cloud" src={treeImg} />
        </span>
        <FormGroup>
          <FormCheckbox
            onChange={() =>
              dispatch({
                type: 'set-billing-detail',
                data: {
                  key: 'donate',
                  value: !state.donate
                }
              })
            }
            checked={state.donate}
            label={`Add $1 to plant a tree`}
            disabled={state.loading}
          />
        </FormGroup>
      </div>
    </>
  );
}
