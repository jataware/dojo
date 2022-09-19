import identity from 'lodash/identity';
import  AnnotationsSubmitPrompt from '../client/datasets/annotations/AnnotationsSubmitPrompt';

export default {
  title: 'Dataset Registration/Annotations Submit Prompt',
  component: AnnotationsSubmitPrompt,
};

const Template = (args) => <AnnotationsSubmitPrompt {...args} />;

export const Base = {
  args: {
    open: true,
    onAccept: identity,
    onDecline: identity,
    warnings: ['Missing X. It will default to Y.', 'Previous primary column overriden.'],
    errors: ['At least one column must be marked as a feature.'],
  }
};

export const WarningOnly = {
  args: {
    open: true,
    onAccept: identity,
    onDecline: identity,
    warnings: ['Missing X. It will default to Y.', 'Previous primary column overriden.'],
    errors: [],
  }
};

export const ErrorOnly = {
  args: {
    open: true,
    onAccept: identity,
    onDecline: identity,
    warnings: [],
    errors: ['At least one column must be marked as a feature.'],
  }
};
