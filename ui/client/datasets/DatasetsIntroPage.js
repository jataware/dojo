import React from 'react';

import GenericIntroPage, { ColorText } from '../components/GenericIntroPage';
import { getBrandName } from '../components/uiComponents/Branding';

const brandName = getBrandName();
const actions = [
  {
    title: <><ColorText>Register</ColorText> a new dataset</>,
    text: `
      Registering a dataset involves uploading a valid dataset file, filling out metadata for it,
      and, once ${brandName}'s systems have inferred data types such as date format and geographic information,
      annotating key columns. You will then have the opportunity to transform your data
      to reduce and normalize it into a well-defined, and ready to use format.
    `,
    linkTitle: 'Register',
    link: '/datasets/register',
    docsLink: 'data-registration',
  },
  {
    title: <>Use the <ColorText>data modeling</ColorText> tool</>,
    text: `
      With the data modeling tool, you can combine NetCDF datasets together through a simple visual
      programming interface to create new and insightful derived datasets. Relatively complex data
      operations and transformations can be performed on a variety of different kinds of data,
      no programming skills required.
    `,
    linkTitle: 'Modeling',
    link: '/data-modeling',
    docsLink: 'data-modeling',
  },
  {
    title: <>View existing <ColorText>datasets</ColorText></>,
    text: `
      Browse the list of all registered datasets in ${brandName}, or filter through them based on metadata or column/feature names.
      From a dataset's summary page, you can download its files, find a link to view it in the downstream visualization
      workflow app Causemos, or edit the registered dataset.

    `,
    linkTitle: 'Datasets',
    link: '/datasets',

  }
];

const subtitle = `
  ${brandName} offers a comprehensive solution for dataset management, combining dataset
  registration with advanced data modeling capabilities. Users can seamlessly integrate,
  view, and modify datasets, ensuring effective data organization and enhancing analytical
  possibilities across various domains.
`;
const DatasetsIntroPage = () => (
  <GenericIntroPage title="Datasets" subtitle={subtitle} actions={actions} />
);

export default DatasetsIntroPage;
