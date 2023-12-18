import React from 'react';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArticleIcon from '@mui/icons-material/Article';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import GenericIntroPage, { ColorText } from '../components/GenericIntroPage';

const actions = [
  {
    title: <><ColorText>Upload</ColorText> new documents</>,
    text: `
      The Document Uploader allows you to upload PDFs to Dojo and annotate their metadata with a simple drag and drop interface.
      Uploaded documents will be searchable with the Document Explorer once they have been processed.
      Documents will also be added to the body of knowledge available to the AI Assistant, allowing
      for plain language question-and-answer style queries.
    `,
    linkTitle: 'Upload',
    link: '/documents/upload',
    linkIcon: <UploadFileIcon />,
  },
  {
    title: <>Ask plain language questions with the <ColorText>AI Assistant</ColorText></>,
    text: `
      With the AI Assistant, you can ask complex, domain-specific questions in simple, non-technical ways.
      The assistant will search through the available documents to provide a well reasoned, in-depth answer
      with citations guiding you to the relevant paragraphs.
    `,
    linkTitle: 'Ask',
    link: '/ai-assistant',
    linkIcon: <SmartToyIcon />,

  },
  {
    title: <>Query documents with <ColorText>semantic search</ColorText></>,
    text: `
      Using context-aware search capabilities, Dojo's Document Explorer lets you directly query uploaded PDFs.
      You can use keyword or phrase searches to find relevant information within the available documents.
    `,
    linkTitle: 'Search',
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
