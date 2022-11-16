import FormatInput from '../client/datasets/FormFields/FormatValidationInput';
import { Field, Formik, Form } from 'formik';

export default {
  title: 'Dataset Registration/FormatValidationInput',
  component: FormatInput,
  decorators: [
    (Story) => (
      <Formik initialValues={{test1: ''}}>
        <Form>
          <Story />
        </Form>
      </Formik>
    )
  ]
};

const Template = (args) => <FormatInput {...args} />;

export const Base = {
  args: {
    name: 'test1',
    label: 'Date Format',
    sampleValue: '2010-12-06',
  }
};
