import React from 'react';
import { GadmResolver } from '../client/datasets/DataTransformation/GadmResolver';

import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import rcountry from 'random-country'; // TODO remove package dependency and this
import random from 'lodash/random';
import times from 'lodash/times';

import theme from '../client/theme';

export default {
  title: 'Dataset Registration/GadmResolver',
  component: GadmResolver,
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
  <GadmResolver {...args} />
);

const mockRowCount = 10;
const mockData = [{
  id: 347634,
  raw_value: 'Republic of Korea',
  gadm_resolved: 'Democratic People\'s Republic of Korea',
  alternatives: [
    'Republic of Korea',
    'Democratic People\'s Republic of Korea'
  ]
}];

for (let i = 0; i < mockRowCount; i++) {
  let country = rcountry({ full: true });
  mockData
    .push({
      id: country+random(1, 100),
      raw_value: country.replace('e','').replace('a','i'),
      gadm_resolved: country,
      alternatives: times(random(1,10), () => rcountry({full: true})),
    });
}

console.log('mockData', mockData);

export const Basic = {
  args: {
    gadmRowData: mockData,
    primaryCountryField: 'eventCountry'
  }
};
