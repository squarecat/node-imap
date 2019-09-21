import './organisation-onboarding.module.scss';

import { Arrow as ArrowIcon } from '../../icons';
import React from 'react';

const steps = [
  {
    value: 'setup',
    position: '1',
    nextLabel: (
      <span styleName="onboarding-btn">
        <span style={{ marginRight: 10 }}>Create Team</span>
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
  loading: false,
  error: false,
  canProceed: true,
  nextLabel: steps[0].nextLabel,
  positionLabel: `1 of ${totalSteps}`,
  invitedUsersCount: 0,
  organisation: {
    name: '',
    domain: '',
    allowAnyUserWithCompanyEmail: false
  }
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
    case 'can-proceed': {
      return {
        ...state,
        canProceed: action.data
      };
    }
    case 'add-invited-users': {
      return {
        ...state,
        invitedUsersCount: state.invitedUsersCount + action.data
      };
    }
    case 'set-organisation': {
      return {
        ...state,
        organisation: {
          ...state.organisation,
          ...action.data
        }
      };
    }
    case 'set-loading': {
      return {
        ...state,
        loading: action.data
      };
    }
    case 'set-error': {
      return {
        ...state,
        error: action.data
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
