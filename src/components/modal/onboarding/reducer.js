import './onboarding.module.scss';

import { Arrow as ArrowIcon, SearchIcon } from '../../icons';

import { Gift as GiftIcon } from '../../icons';
import React from 'react';

const steps = [
  {
    value: 'welcome',
    nextLabel: (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 10 }}>Connect accounts</span>
        <ArrowIcon direction="right" />
      </span>
    )
  },
  {
    value: 'accounts',
    nextLabel: (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 10 }}>Next</span>
        <ArrowIcon direction="right" />
      </span>
    )
  },
  {
    value: 'rewards',
    nextLabel: (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 8 }}>Claim credits</span>
        <GiftIcon height={22} width={22} amount={10} filled />
      </span>
    )
  },
  {
    value: 'finish',
    nextLabel: (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 8 }}>Let's do it!</span>
        <ArrowIcon direction="right" />
      </span>
    )
  }
];

export const initialState = {
  step: steps[0].value,
  isLoading: false,
  canProceed: true,
  nextLabel: steps[0].nextLabel,
  organisationMember: false
};

export default (state, action) => {
  switch (action.type) {
    case 'next-step': {
      const { value: step, nextLabel } = getNextStep(state);
      return {
        ...state,
        step,
        nextLabel
      };
    }
    case 'prev-step': {
      const { value: step, nextLabel } = getPrevStep(state);
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
    case 'organisation-member': {
      return {
        ...state,
        organisationMember: action.data
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
  let nextStep = steps[currentStep + 1];

  if (nextStep.value === 'rewards' && state.organisationMember) {
    nextStep = steps[currentStep + 2];
  }
  return nextStep;
}
function getPrevStep(state) {
  const currentStep = steps.findIndex(d => d.value === state.step);
  let prevStep = steps[currentStep - 1];

  if (prevStep.value === 'rewards' && state.organisationMember) {
    prevStep = steps[currentStep - 2];
  }
  return prevStep;
}
