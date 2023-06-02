import React from 'react';

import { FileTile } from '../../client/documents/upload/index';

export default {
  title: 'Document Explorer/Upload New Document/FileTile',
  component: FileTile
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
