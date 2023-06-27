import React from 'react';
import { GadmResolverV1 } from '../client/datasets/DataTransformation/GadmResolver';

import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import random from 'lodash/random';

import theme from '../client/theme';

export default {
  title: 'Dataset Registration/GadmResolverV1',
  component: GadmResolverV1,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    )
  ]
};

const Template = (args) => (
  <GadmResolverV1 {...args} />
);

const mockRowCount = 10;
const mockData = [{
  id: 347634,
  raw_value: 'Republic of Korea',
  gadm_resolved: 'Democratic People\'s Republic of Korea'
}];

for (let i = 0; i < mockRowCount; i++) {
  let country = 'japan';
  mockData
    .push({
      id: random(1, 10000),
      raw_value: country.replace('e','').replace('a','i'),
      gadm_resolved: country, adjusted: '-'
    });
}

export const Basic = {
  args: {
    gadmRowData: mockData,
    primaryCountryField: 'eventCountry'
  }
};
