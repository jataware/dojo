import React from 'react';

import AssessmentIcon from '@mui/icons-material/Assessment';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import RunCircleIcon from '@mui/icons-material/RunCircle';

import GenericIntroPage, { ColorText } from '../components/GenericIntroPage';

const actions = [
  {
    title: <><ColorText>register</ColorText> a new model</>,
    text: `
      Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
      The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
    `,
    linkTitle: 'Register a Model',
    link: '/model',
    linkIcon: <KeyboardIcon />,
  },
  {
    title: <>view <ColorText>existing models</ColorText></>,
    text: `
      Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
      The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
    `,
    linkTitle: 'View Models',
    link: '/models',
    linkIcon: <FormatListBulletedIcon />,

  },
  {
    title: <>view <ColorText>model runs</ColorText></>,
    text: `
      Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
      The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
    `,
    linkTitle: 'Model Runs',
    link: '/runs',
    linkIcon: <RunCircleIcon />,
  },
];

const subtitle = `
  Dojo allows modelers to seamlessly register their models via a highly instrumented terminal emulator.
  Dojo stores models as reusable Docker containers with consistent, well specified application programming interfaces (APIs).
  This allows them to be leveraged by non-modelers or analysts for simulation and what-if analysis.
`;

const ModelsIntroPage = () => (
  <GenericIntroPage title="Models" subtitle={subtitle} actions={actions} />
);

export default ModelsIntroPage;
