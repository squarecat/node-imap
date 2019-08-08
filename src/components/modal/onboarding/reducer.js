import './onboarding.module.scss';

import { Arrow as ArrowIcon, SearchIcon } from '../../icons';

import { Gift as GiftIcon } from '../../icons';
import React from 'react';

export const steps = [
  {
    value: 'welcome',
    position: '1',
    nextLabel: () => (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 10 }}>Connect account</span>
        <ArrowIcon direction="right" />
      </span>
    )
  },
  {
    value: 'accounts',
    position: '2',
    nextLabel: () => (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 10 }}>Next</span>
        <ArrowIcon direction="right" />
      </span>
    )
  },
  {
    value: 'rewards',
    position: '3',
    nextLabel: ({ startingCredits }) => (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 8 }}>Claim credits</span>
        <GiftIcon height={22} width={22} amount={startingCredits} filled />
      </span>
    ),
    isHidden: organisationMember => organisationMember
  },
  {
    value: 'organisation',
    position: '3',
    nextLabel: () => (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 8 }}>Next</span>
        <ArrowIcon direction="right" />
      </span>
    ),
    isHidden: organisationMember => !organisationMember
  },
  {
    value: 'finish',
    position: '4',
    nextLabel: () => (
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
  nextLabel: steps[0].nextLabel(),
  positionLabel: '1 of 4',
  organisationMember: false
};

export default (state, action) => {
  switch (action.type) {
    case 'next-step': {
      const { value: step, nextLabel, position } = getNextStep(state);
      return {
        ...state,
        step,
        nextLabel: nextLabel(state),
        positionLabel: `${position} of 4`
      };
    }
    case 'prev-step': {
      const { value: step, nextLabel, position } = getPrevStep(state);
      return {
        ...state,
        step,
        nextLabel: nextLabel(state),
        positionLabel: `${position} of 4`
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
    case 'set-starting-credits':
      return {
        ...state,
        startingCredits: action.data
      };
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

  if (nextStep.isHidden && nextStep.isHidden(state.organisationMember)) {
    nextStep = steps[currentStep + 2];
  }
  return nextStep;
}

function getPrevStep(state) {
  const currentStep = steps.findIndex(d => d.value === state.step);
  let prevStep = steps[currentStep - 1];

  if (prevStep.isHidden && prevStep.isHidden(state.organisationMember)) {
    prevStep = steps[currentStep - 2];
  }
  return prevStep;
}
