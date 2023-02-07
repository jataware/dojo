import React from 'react';
// import { Field, Formik, Form } from 'formik';

import { FileTile } from '../client/documents/UploadForm';

export default {
  title: 'DocumentUpload/FileTile',
  component: FileTile,

  // decorators: [
  //   (Story) => (
  //       <Formik>
  //       {(formik) => (
  //           <Form>
  //           <Story />
  //           </Form>
  //       )}
  //     </Formik>
  //   )
  // ]
};

const Template = (args) => (
    <FileTile {...args} />
);

export const Basic = {
  args: {
    file: {
      path: "test.pdf",
      size: 34783443
    }
  }
};
