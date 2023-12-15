import React from 'react';

import AssessmentIcon from '@mui/icons-material/Assessment';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import RunCircleIcon from '@mui/icons-material/RunCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArticleIcon from '@mui/icons-material/Article';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import GenericIntroPage, { ColorText } from '../components/GenericIntroPage';

const actions = [
  {
    title: <><ColorText>upload</ColorText> new documents</>,
    text: `
      Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
      The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
    `,
    linkTitle: 'Upload',
    link: '/documents/upload',
    linkIcon: <UploadFileIcon />,
  },
  {
    title: <>Ask plain language questions with the <ColorText>AI Assistant</ColorText></>,
    text: `
      Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
      The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
    `,
    linkTitle: 'AI Assistant',
    link: '/ai-assistant',
    linkIcon: <SmartToyIcon />,

  },
  {
    title: <>Query documents with <ColorText>semantic search</ColorText></>,
    text: `
      Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
      The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
    `,
    linkTitle: 'Search Documents',
    link: '/documents',
    linkIcon: <ArticleIcon />,
  },
];

const subtitle = `
  Dojo includes a state of the art knowledge retrieval AI Assistant.
`;

const DatasetsIntroPage = () => (
  <GenericIntroPage title="Documents" subtitle={subtitle} actions={actions} />
);

export default DatasetsIntroPage;
