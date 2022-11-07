import React from 'react';
import identity from 'lodash/identity';

import TableAnnotation from '../client/datasets/annotations/Table';
import sampleData from '../client/datasets/data/sampleData2';

const columnsBase = [
  {
    field: 'latitude',
  },
  {
    field: 'longitude',
  },
  {
    field: 'date',
  },
  {
    field: 'value',
  },
  {
    field: 'color_hue',
  },
  {
    field: 'date_month',
  },
  {
    field: 'date_day',
  },
  {
    field: 'date_year',
  },
];

const annotations = {
  date: {
    annotated: true,
    description: 'its hardcoded yo!',
    category: 'time',
    primary: true
  },
  longitude: {
    annotated: true,
    description: 'test',
    category: 'geo'
  },
  value: {
    annotated: true,
    description: 'test2',
    category: 'feature'
  }
};

const inferredData = {
  date: {
    category: 'date'
  },
  latitude: {
    category: 'geo'
  }
};

function annotateColumns(values) {
  console.log('annotation values', values);
}

export default {
  title: 'Dataset Registration/Table Annotation',
  component: TableAnnotation,
  decorators: [
    (Story) => (
      <div style={{height: '90vh', width: '95vw',
                   display: 'flex', flexDirection: 'column'}}>
        <Story />
      </div>
    )
  ]
};

const Template = (args) => (
    <TableAnnotation {...args} />
);

export const Base = {
  args: {
    annotateColumns,
    rows: sampleData,
    columns: columnsBase,
    annotations,
    inferredData: inferredData,
    multiPartData:{},
    setMultiPartData: identity
  }
};
