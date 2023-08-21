import 'cypress-iframe';
import { genBaseModel, generatedIDs } from '../seeds/model_api_data';
const { faker } = require('@faker-js/faker');

const date = Date.now().toString();
const directiveCmd = `run file.txt --data=${date}`;
const modelName = `TestModel_created_at=${date}`;

import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import last from 'lodash/last';

import { createModel, shutdownWorker,
         provisionAndWaitReady,
         waitForAllUrlsToFinish,
         getTestModelRegisterUrls,
         waitUrlToProcess } from '../support/helpers';

/**
 *
 **/
function cleanModel(modelId) {

  cy.visit('/admin');

  return shutdownWorker().then(() => {
    console.log('Done clearing worker, clearing seeds.');
    cy.task('seed:clean', {type: 'model', id: modelId});
  });
}



// NOTE slowest test of them all since it registers jataware/test-model
// and cannot determine how much to wait for the HTML canvas terminal ssh session
// commands.
describe('Register/Publish Test Model', { browser: ['chrome', 'chromium', 'firefox'] }, () => {

  let modelId = undefined;

  afterEach(() => {
    cleanModel(modelId);
  });

  it('E2E jataware/test-model Register/Publish completed.', () => {

    // in case we want to reuse/override a test with forced ID:
    // modelId = 'acab2a55-8356-4029-99c2-734b4939293e';

    const modelOverrides = {
      is_published: false,
      commit_message: '',
      period: null,
      outputs: [],
      image: '',
      qualifier_outputs: [],
      geography: null
    };

    const testModel = createModel(modelId, modelOverrides);

    modelId = testModel.id;

    console.log('Test Model ID:', modelId);

    cy.wrap(provisionAndWaitReady(modelId))
      .then(() => {

        const directiveParamValue = 4.8;
        const fileName = `output_0.9_${directiveParamValue}.csv`;
        const folderName = 'test-model';
        const user = 'clouseau';
        const homeDir = `/home/${user}`;

        const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

        cy.visit(`/term/${testModel.id}`);

        cy.reload();

        cy.findByRole('textbox', {name: /terminal input/i}).as('TerminalInput');

        cy.wait(500);

        cy.get('@TerminalInput')
          .type(`sudo apt update && sudo apt install -y python3-pip && git clone https://github.com/jataware/test-model.git && cd test-model{enter}`, {force: true});

        cy.wait(25000); // 60000 for slower computers

        // cy.get('@TerminalInput')
        //   .type('echo finished setup{enter}', {force: true});
        // cy.findByText(/finished setup/i, {timeout: 20000});

        cy.get('@TerminalInput')
          .type(`git checkout 041cdfa10a995a2d55baeb3ebe35320f22bc996a && pip3 install -r requirements.txt{enter}`, {force: true});

        cy.wait(6000); // 20000+ for slower computers

        cy.get('@TerminalInput')
          .type('echo finished install{enter}', {force: true});

        cy.findByText(/finished install/i, {timeout: 20000});

        cy.get('@TerminalInput')
          .type(`python3 main.py --temp=${directiveParamValue}{enter}`);

        cy.get('@TerminalInput')
          .type('echo finished run{enter}', {force: true});

        cy.findByText(/finished run/i);

        cy.get('@TerminalInput')
          .type('dojo tag media/1WWMDwIQ_400x400.jpg "1"{enter}');

        cy.get('@TerminalInput')
          .type('echo finished tag{enter}', {force: true});

        cy.findByText(/finished tag/i);

        const urls = getTestModelRegisterUrls(modelId, {homeDir, user, fileName, folderName, saveUrl, directiveParamValue});

        cy.wrap(waitForAllUrlsToFinish(urls)).then(() => {

          // TODO check with remote/auth:
          cy.request('PATCH', `/api/dojo/models/${modelId}`, {
            "outputs": [
              {
                "uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                "name": "value",
                "display_name": "value",
                "description": "featval",
                "type": "float",
                "unit": "fv",
                "unit_description": "",
                "is_primary": false,
                "data_resolution": {
                  "temporal_resolution": "annual"
                },
                "alias": {},
                "choices": null,
                "min": null,
                "max": null,
                "ontologies": null
              }
            ],
            "qualifier_outputs": [
              {
                "uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                "name": "date",
                "display_name": "date",
                "description": "date",
                "type": "datetime",
                "unit": null,
                "unit_description": null,
                "related_features": [],
                "qualifier_role": "breakdown",
                "alias": {}
              },
              {
                "uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                "name": "longitude",
                "display_name": "latitude",
                "description": "latlon",
                "type": "lng",
                "unit": null,
                "unit_description": null,
                "related_features": [],
                "qualifier_role": "breakdown",
                "alias": {}
              },
              {
                "uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                "name": "latitude",
                "display_name": "latitude",
                "description": "latlon",
                "type": "lat",
                "unit": null,
                "unit_description": null,
                "related_features": [],
                "qualifier_role": "breakdown",
                "alias": {}
              }
            ]
          }).then(() => {

            cy.wrap(waitUrlToProcess(`/api/dojo/dojo/config/${modelId}`, '[0]'))
              .then(() => {

                cy.intercept('POST', `/api/terminal/docker/${modelId}/commit`).as('ModelTerminalCommit');

                cy.findByRole('button', {name: /save and continue/i})
                  .click();

                cy.findByText(/Uploading Model to Docker.+/i);

                cy.wait(10000);

                cy.findByText(/Upload Complete.+/i, {timeout: 25000});

                cy.intercept('POST', `/api/dojo/models/register/${modelId}`).as('RegisterModelComplete');

                cy.get('@ModelTerminalCommit').should((inter) => {
                  expect(inter.request.body.tags[0]).to.contain(modelId);
                  expect(inter.response.body).to.contain('Processing');
                });

                cy.findByRole('button', {name: /Publish/i})
                  .click();

                cy.findByRole('dialog', {name: /Are you ready to publish the model?/i})
                  .as('PublishDialog');

                const commitMessage = faker.commerce.productDescription();

                cy.get('@PublishDialog')
                  .findByRole('textbox')
                  .type(commitMessage);

                cy.get('@PublishDialog')
                  .findByRole('button', {name: /Yes/i})
                  .click();

                cy.findByText(/Your model was successfully published/i);

                cy.get('@RegisterModelComplete')
                  .should((inter) => {
                    expect(inter.response.body).to.contain('Registered model to');
                  })
                  .then(() => {
                    // TODO check with remote/auth:
                    cy.request('GET', `/api/dojo/models/${modelId}`)
                      .should((response) => {
                        expect(response.status).to.equal(200);
                        expect(response.body.is_published).to.equal(true);
                        expect(response.body.commit_message).to.equal(commitMessage);
                        expect(response.body.outputs).to.not.be.empty;
                        expect(response.body.qualifier_outputs).to.not.be.empty;
                      });
                  });
              });
          });
        });
      });
  });
});
