import React from 'react';

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
    docsLink: 'documents#document-uploader',
  },
  {
    title: <>Ask complex questions with the <ColorText>AI Assistant</ColorText></>,
    text: `
      With the AI Assistant, you can ask complex, domain-specific questions in simple, non-technical ways.
      The assistant will search through the available documents to provide a well reasoned, in-depth answer
      with citations guiding you to the relevant paragraphs.
    `,
    linkTitle: 'Ask',
    link: '/ai-assistant',
  },
  {
    title: <>Explore documents with <ColorText>semantic search</ColorText></>,
    text: `
      Using context-aware search capabilities, Dojo's Document Explorer lets you directly query uploaded PDFs.
      You can use keyword or phrase searches to find relevant information within the available documents.
    `,
    linkTitle: 'Search',
    link: '/documents',
    docsLink: 'documents#document-explorer',
  },
];

const subtitle = `
  Dojo enhances document management with AI-assisted capabilities, offering a dynamic platform
  for document upload, search, and analysis. It integrates advanced language models to empower
  users with intuitive querying and deep insights, streamlining knowledge discovery and
  supporting informed decision-making in complex domains.
`;

const DatasetsIntroPage = () => (
  <GenericIntroPage title="Documents" subtitle={subtitle} actions={actions} />
);

export default DatasetsIntroPage;
