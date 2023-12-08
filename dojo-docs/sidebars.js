/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    dojoSidebar: [
      {
        type: 'doc',
        id: 'index',
        label: 'Intro to Dojo',
      },
      {
        type: 'category',
        label: 'Model Registration',
        link: {
          type: 'doc',
          id: 'model-registration',
        },
        items: [
          {
            type: 'doc',
            id: 'details/cheatsheet',
            label: 'Cheatsheet',
          },
          {
            type: 'doc',
            id: 'details/excel',
            label: 'Excel Models',
          },
          {
            type: 'doc',
            id: 'details/jupyter',
            label: 'Jupyter Notebooks',
          },
          {
            type: 'doc',
            id: 'details/matlab',
            label: 'MATLAB Models',
          },
          {
            type: 'doc',
            id: 'details/docker',
            label: 'Prebuilt Containers',
          },
          {
            type: 'doc',
            id: 'details/large-files',
            label: 'Uploading Large Files',
          },
        ],
      },
      {
        type: 'category',
        label: 'Data Registration',
        link: {
          type: 'doc',
          id: 'data-registration',
        },
        items: [
          {
            type: 'doc',
            id: 'details/geotemporal-format',
            label: 'Geotemporal Format',
          },
          {
            type: 'doc',
            id: 'details/data-format',
            label: 'Preparing Data for Dojo',
          },
        ],
      },
      {
        type: 'category',
        label: 'Data Modeling',
        link: {
          type: 'doc',
          id: 'data-modeling',
        },
        items: [
          {
            type: 'doc',
            id: 'details/aggregation-methods',
            label: 'Aggregation Methods',
          },
        ],
      },
      // AI Assistant section is commented out in the YAML, so it's not included here.
      {
        type: 'doc',
        id: 'dojo-api',
        label: 'Dojo API',
      },
      {
        type: 'doc',
        id: 'documents',
        label: 'Documents',
      },
      {
        type: 'category',
        label: 'Model Execution',
        link: {
          type: 'doc',
          id: 'model-execution',
        },
        items: [
          {
            type: 'doc',
            id: 'details/dojo-cli',
            label: 'Dojo CLI Commands',
          },
        ],
      },
      {
        type: 'doc',
        id: 'FAQ',
        label: 'Frequently Asked Questions',
      },
    ],


};

export default sidebars;
