import React from 'react';

import AssessmentIcon from '@mui/icons-material/Assessment';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import GenericIntroPage, { ColorText } from '../components/GenericIntroPage';

const actions = [
  {
    title: <><ColorText>register</ColorText> a new dataset</>,
    text: `
      Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
      The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
    `,
    linkTitle: 'Register',
    link: '/datasets/register',
    linkIcon: <KeyboardIcon />,
  },
  {
    title: <>use the <ColorText>data modeling</ColorText> tool</>,
    text: `
      Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
      The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
    `,
    linkTitle: 'Data Modeling',
    link: '/data-modeling',
    linkIcon: <AssessmentIcon />,
  },
  {
    title: <>view existing <ColorText>datasets</ColorText></>,
    text: `
      Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
      The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
    `,
    linkTitle: 'View Datasets',
    link: '/datasets',
    linkIcon: <FormatListBulletedIcon />,

  }
];

const subtitle = `
  Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
  The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
`;

const DatasetsIntroPage = () => (
  <GenericIntroPage title="Datasets" subtitle={subtitle} actions={actions} />
);

export default DatasetsIntroPage;
