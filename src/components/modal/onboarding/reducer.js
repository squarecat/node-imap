import './onboarding.module.scss';

import { Arrow as ArrowIcon } from '../../icons';
import React from 'react';

const steps = [
  {
    value: 'welcome',
    nextLabel: (
      <span>
        <span style={{ marginRight: 10 }}>Connect accounts</span>
        <ArrowIcon direction="right" />
      </span>
    )
  },
  {
    value: 'accounts',
    nextLabel: (
      <span>
        <span style={{ marginRight: 10 }}>I'm done</span>
        <ArrowIcon direction="right" />
      </span>
    )
  },
  {
    value: 'rewards',
    nextLabel: (
      <span>
        <span style={{ marginRight: 10 }}>Claim reward</span>
        <span styleName="reward-icon">10</span>
      </span>
    )
  },
  { value: 'finish', nextLabel: 'Start scan' }
];

export const initialState = {
  step: steps[0].value,
  isLoading: false,
  canProceed: true,
  nextLabel: steps[0].nextLabel
};

export default (state, action) => {
  switch (action.type) {
    case 'next-step': {
      const { value: step, nextLabel } = steps[
        steps.findIndex(d => d.value === state.step) + 1
      ];
      return {
        ...state,
        step,
        nextLabel
      };
    }
    case 'prev-step': {
      const { value: step, nextLabel } = steps[
        steps.findIndex(d => d.value === state.step) - 1
      ];
      return {
        ...state,
        step,
        nextLabel
      };
    }
    case 'can-proceed': {
      return {
        ...state,
        canProceed: action.data
      };
    }
    default:
      return state;
  }
};

export function isFirstStep(state) {
  return steps.indexOf(state.step) !== 0;
}
