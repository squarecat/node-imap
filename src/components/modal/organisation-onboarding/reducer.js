import './organisation-onboarding.module.scss';

import { Arrow as ArrowIcon } from '../../icons';
import React from 'react';

const steps = [
  {
    value: 'welcome',
    position: '1',
    nextLabel: (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 10 }}>Next</span>
        <ArrowIcon direction="right" />
      </span>
    )
  },
  {
    value: 'invite',
    position: '2',
    nextLabel: (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 10 }}>Next</span>
        <ArrowIcon direction="right" />
      </span>
    )
  },
  {
    value: 'accounts',
    position: '3',
    nextLabel: (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 10 }}>Next</span>
        <ArrowIcon direction="right" />
      </span>
    )
  },
  {
    value: 'finish',
    position: '4',
    nextLabel: (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 10 }}>Let's do this!</span>
        <ArrowIcon direction="right" />
      </span>
    )
  }
];

const totalSteps = steps.length;

export const initialState = {
  step: steps[0].value,
  isLoading: false,
  nextLabel: steps[0].nextLabel,
  positionLabel: `1 of ${totalSteps}`,
  invitedUsersCount: 0
};

export default (state, action) => {
  switch (action.type) {
    case 'next-step': {
      const { value: step, nextLabel, position } = getNextStep(state);
      return {
        ...state,
        step,
        nextLabel,
        positionLabel: `${position} of ${totalSteps}`
      };
    }
    case 'prev-step': {
      const { value: step, nextLabel, position } = getPrevStep(state);
      return {
        ...state,
        step,
        nextLabel,
        positionLabel: `${position} of ${totalSteps}`
      };
    }
    case 'add-invited-user': {
      return {
        ...state,
        invitedUsersCount: state.invitedUsersCount + 1
      };
    }
    default:
      return state;
  }
};

export function isFirstStep(state) {
  return steps.indexOf(state.step) !== 0;
}

function getNextStep(state) {
  const currentStep = steps.findIndex(d => d.value === state.step);
  return steps[currentStep + 1];
}

function getPrevStep(state) {
  const currentStep = steps.findIndex(d => d.value === state.step);
  return steps[currentStep - 1];
}
