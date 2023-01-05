import React from 'react';
import { Field, Formik, Form } from 'formik';
import identity from 'lodash/identity';

import { ViewDocumentDialog } from '../client/documents';

export default {
  title: 'Document Explorer/ViewDocument Dialog',
  component: ViewDocumentDialog,
};

const Template = (args) => (
  <ViewDocumentDialog {...args} />
);

export const Basic = Template.bind({});
Basic.args = {
  doc: {
    author: "Mulualem Denbegna",
    classification: "UNCLASSIFIED",
    creation_date: "2015-07-27",
    description: "Jul 27, 2015 (The Ethiopian Herald/All Africa Global Media via COMTEX) -- Barack Obama, President of the United States of America, will visit Ethiopia on July 26, 2015. Obama will become the first sitting US president to visit Ethiopia.\n\nIn Ethiopia Obama, among other schedules, will meet with Ethiopian high-ranking government officials and discuss on issues of mutual concern. He is also expected to visit the Addis Ababa headquarters of the African Union, which has played an increasingly active role in trying to maintain regional and economic stability in the region.",
    id: "9de0730d71ca13d19c22aa5f6fee903e",
    mod_date: "2015-07-27",
    original_language: "en",
    producer: "Dow Jones",
    publisher: "All Africa Global Media",
    stated_genre: "news-article",
    title: "Obama's Visit - Confirmation of Ethio-U.S. Strong Bilateral Ties",
    type: "article"
  }
};
