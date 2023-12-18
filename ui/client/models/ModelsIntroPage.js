import React from 'react';

import GenericIntroPage, { ColorText } from '../components/GenericIntroPage';

const actions = [
  {
    title: <><ColorText>Register</ColorText> a new model</>,
    text: `
      Model registration involves providing detailed information about your model, including its purpose, capabilities, and technical specifications.
      This is done through a two step process: first, entering metadata about the model and maintainer;
      second, using the terminal emulator to build the image of your model that will be registered into the system.
      This will be uploaded to Dockerhub when the registration process is complete.
    `,
    linkTitle: 'Register',
    link: '/model',
    docsLink: 'model-registration',
  },
  {
    title: <>View <ColorText>existing models</ColorText></>,
    text: `
      This feature allows you to browse and search through the registered models in Dojo.
      Once you've selected a model, you can relaunch it in the terminal emulator, make changes,
      and save a new version of it to Dockerhub. You can also kick off a Model Run
      from a selected model's summary page.
    `,
    linkTitle: 'Models',
    link: '/models',

  },
  {
    title: <>View <ColorText>model runs</ColorText></>,
    text: `
      View a list of all previous model runs.
    `,
    /* OR some verison of:
    View Runs in Dojo provides a comprehensive overview of all model executions.
    This feature tracks the performance and outcomes of each run, offering insights
    into model efficiency and effectiveness.
    It's a vital tool for understanding model behavior and refining modeling strategies.
    */
    linkTitle: 'Runs',
    link: '/runs',
    docsLink: 'model-execution',
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
