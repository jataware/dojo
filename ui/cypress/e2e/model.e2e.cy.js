import { genBaseModel, generatedIDs } from '../seeds/model_api_data';

const date = Date.now().toString();
const directiveCmd = `run file.txt --data=${date}`;
const modelName = `TestModel_created_at=${date}`;

import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import last from 'lodash/last';

import { provisionModelTerminal, shutdownWorker,
         provisionTerminalWaitReady, getModelRegisterUrls, waitUrlToProcess,
         waitForAllUrlsToFinish
       } from '../support/helpers';


const username = Cypress.env('DOJO_DEMO_USER');
const password = Cypress.env('DOJO_DEMO_PASS');
const hasAuth = Boolean(username) && Boolean(password);
const auth = hasAuth ? {username, password} : undefined;

const isAuthEnabledRemote = hasAuth;

/**
 *
 **/
function cleanModel(modelId) {
  cy.visit('/admin', {auth});

  return cy.wrap(shutdownWorker()).then(() => {
    if (!isAuthEnabledRemote) {
      cy.log('Done clearing worker, clearing seeds.');
      cy.task('seed:clean', {type: 'model', id: modelId});
    } else {
      const message = 'Auth enabled; skip seed cleaning.';
      // cy.task('debug', message);
      cy.log(message);
    }
  });
}


describe(
  'Model Metadata: Creating a Model up to terminal step',
  { browser: ['chrome', 'chromium', 'firefox'] },
  () => {

    beforeEach(() => {
      cy.wrap(shutdownWorker());
    });

    afterEach(() => {
      cy.location()
        .then((loc) => {
          const modelId = last(loc.pathname.split('/'));
          cleanModel(modelId);
        });
    });

    it('Creates a model with all the metadata fields and just the basic terminal steps', () => {

      cy.visit('/', {auth});

      cy.get('[data-test=landingPageModelForm]').click();
      // overview form
      cy.get('[data-test=modelForm-name]').type(modelName);
      cy.get('[data-test="modelForm-maintainer.website"]').clear().type('http://jataware.com');
      cy.get('[data-test=modelForm-family_name]').type('Test Family Name');
      cy.get('[data-test=modelForm-description]')
        .type('This is a test description. It is long enough.');
      cy.get('[data-test=modelFormOverviewNextBtn]').click();

      // detail form
      cy.get('[data-test="modelForm-maintainer.name"]').type('Maintainer Test Name');
      cy.get('[data-test="modelForm-maintainer.email"]').type('test@example.com');
      cy.get('[data-test="modelForm-maintainer.organization"]')
        .type('Maintainer Test Organization');

      cy.findByRole('textbox', {name: /model start date/i})
        .type('01/01/2030');

      cy.findByRole('textbox', {name: /model end date/i})
        .type('01/01/2040');

      // add domains
      cy.get('[data-test=modelFormDomain]').type('politi').then(() => {
        cy.contains('Political Science').click();
      });
      cy.get('[data-test=modelFormDomain]').type('medica').then(() => {
        cy.contains('Medical Science').click();
      });
      cy.get('[data-test=modelFormDetailNextBtn]').click();

      // region form
      cy.get('[data-test=modelFormExpandRegionBtn]').click();

      // add texas
      cy.get('[data-test=modelFormRegionSearch]').type('Texas').then(() => {
        cy.get('[data-test=modelFormRegionSearchBtn]').click();
        cy.contains('Texas, admin1').click();
        cy.get('[data-test=modelFormRegionSearchBtn]').click();
      });

      // check we have the correct region and nothing else
      cy.contains('Texas, admin1').should('exist');
      cy.contains('Los Angeles, admin2').should('not.exist');

      // add a region by coordinates
      cy.get('[data-test=modelFormExpandCoordsBtn]').click();
      cy.get('[data-test=modelForm-Lat1]').type('12');
      cy.get('[data-test=modelForm-Lng1]').type('21');
      cy.get('[data-test=modelForm-Lat2]').type('-12');
      cy.get('[data-test=modelForm-Lng2]').type('-21').then(() => {
        cy.get('[data-test=modelFormCoordsBtn]').click();
        // check that it showed up
        cy.contains('12 21, -12 -21').should('exist');
      });

      cy.get('[data-test=modelFormSubmitBtn]').click();
      // intercept our request to fetch the base images, so we aren't relying on dockerhub
      // and respond with the mock set of images in ../fixtures/images.json
      cy.intercept('GET', '/api/dojo/ui/base_images', { fixture: 'images.json' });
      cy.get('[data-test=selectImage]').click();
      cy.contains('Ubuntu').click();

      cy.get('[data-test=modelContainerLaunchBtn]').click();

      // create an alias for one of the endpoints that the terminal will hit when it loads
      cy.intercept('/api/dojo/dojo/outputfile/*').as('outputFiles');
      // and then wait until it is hit (give it an absurdly long time to timeout)
      cy.wait('@outputFiles', { timeout: 300000 });

      cy.wait(1000);

      // make sure xterm has loaded
      cy.get('.xterm-helper-textarea').should('exist');

      // type in a directive
      cy.get('.xterm-helper-textarea').type(`${directiveCmd}{enter}`);

    });

  });


describe('Model output annotation', { browser: ['chrome', 'chromium', 'firefox'] }, () => {

  let modelId;

  afterEach(() => {
    cleanModel(modelId);
  });

  it('Creates a file and edits with dojo edit', () => {

    modelId = undefined;

    const testModel = genBaseModel(modelId);

    modelId = testModel.id;

    cy.seed({type: 'model', data: testModel})
      .then(() => {

      cy.wrap(provisionTerminalWaitReady(modelId)).then(() => {

        cy.visit(`/term/${testModel.id}`, {auth}); // Can't visit WS term on HTTPS upgrade Cypress

        cy.reload();

        const fileName = 'output_data.csv';
        const folderName = 'testmodel';

        cy.findByRole('textbox', {name: /terminal input/i})
          .type(`mkdir ${folderName}{enter}`)
          .type(`cd ${folderName}{enter}`)
          .type(`touch ${fileName}{enter}`)
          .type(`dojo edit ${fileName}{enter}`);

        cy.findByRole('button', {name: /^close/i});

        cy.findByRole('textbox').as('EditingText');

        cy.get('@EditingText')
          .type('latitude,longitude,date,value,color_hue{enter}');

        cy.get('@EditingText')
          .type('60.4985255,-10.615118,1986-07-31,0.1237884593924997,#a04620{enter}28.5827915,-103.818624,2019-09-25,0.8583255955703992,#c61352{enter}', {force: true} );

        const saveUrl = `/api/terminal/container/${modelId}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

        cy.intercept({
          method: 'POST',
          url: saveUrl,
          auth // TODO breaks in local. Conditionally add auth object on intercept?
        }).as('SavingNewFile');

        cy.findByRole('button', {name: /save/i})
          .click();

        cy.get('@SavingNewFile')
          .then(({request, response}) => {
            expect(request.query.path).to.contain(fileName);
            expect(request.body).to.contain('latitude');
            expect(response.body).to.equal('ok');
          });

      });
    });
  });

  it('Annotate model output', () => {

    cy.intercept({
      method: 'POST',
      url: '/api/dojo/job/clear/*'
    }, 'No job found for uuid = mock-test-guid');

    // modelId = '71eec6fb-54f3-4ea0-b1ca-4505c03ea22a'; // undefined;
    modelId = undefined;

    const testModel = genBaseModel(modelId);

    modelId = testModel.id;

    cy.seed({type: 'model', data: testModel})
      .then(() => {
        cy.wrap(provisionTerminalWaitReady(modelId)).then(() => {

          const fileName = 'output_data.csv';
          const folderName = 'testmodel';

          const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

          cy.wait(3000);

          const baseUrl = Cypress.config('baseUrl');
          cy.visit(`/term/${testModel.id}`, {auth});

          cy.reload();

          cy.findByRole('textbox', {name: /terminal input/i})
            .type(`mkdir ${folderName}{enter}`)
            .type(`cd ${folderName}{enter}`)
            .type(`touch ${fileName}{enter}`)
            .type('cd ..{enter}');

          cy.readFile('cypress/files/sample_output.csv').then((contents) => {

            cy
              .intercept({
                method:'POST',
                url: `/api/dojo/job/${modelId}/tasks.model_output_analysis`,
                auth
              })
              .as('FilePreAnalysis');

            return cy.request({
              method: 'POST',
              url: saveUrl,
              body: contents,
              auth
            });
          }).then(() => {

            cy.findByRole('textbox', {name: /terminal input/i})
              .type(`cd ${folderName}{enter}dojo annotate ${fileName}{enter}`);

            cy.findByRole('button', {name: /close/i});

            cy.findByRole('textbox', {name: /Name/i}).type('named!');

            cy.findByRole('textbox', {name: /Description/i}).type('desc');

            cy.findByRole('combobox').as('DomainsSelector');
            cy.get('@DomainsSelector').type('Logic');

            // NOTE Protects against current Dojo App bug / race-condition (can click next until processed...)
            cy.wait('@FilePreAnalysis');

            cy.findAllByRole('button', {name: /Next/i}).click();

            cy.findAllByRole('button', {name: /Annotate/i, timeout: 65000})
              .eq(0)
              .click();

            cy.findByRole('textbox', {name: /Description/i})
              .type('hello lat lon');

            cy.findByRole('checkbox', {name: /This is my primary geo field/i})
              .click();

            cy.findByRole('checkbox', {name: /This is part of a coordinate pair/i})
              .click();

            cy.findByRole('button', {name: /geocoding level/i})
              .click();

            cy.findByRole('listbox').contains('Country')
              .click();

            cy.findByRole('button', {name: /save/i})
              .click();

            cy.findAllByRole('button', {name: /Annotate/i})
              .eq(0)
              .click();

            cy.findByRole('textbox', {name: /Description/i})
              .type('hello date');

            cy.findByRole('checkbox', {name: /This is my primary date field/i})
              .click();

            cy.findByRole('button', {name: /save/i})
              .click();

            cy.findAllByRole('button', {name: /Annotate/i})
              .eq(0)
              .click();

            cy.findByRole('textbox', {name: /units/i})
              .type('vals');

            cy.findAllByRole('textbox', {name: /Description/i})
              .eq(0)
              .type('hello feature');

            cy.findByRole('button', {name: /save/i})
              .click();

            cy.get('body').click();

            cy.wait(100);

            cy.findAllByRole('button', {name: /next/i})
              .eq(1)
              .click();

            cy.intercept({
              url: `/api/dojo/indicators/${modelId}/preview/processed?filepath=model-output-samples/*.csv`,
              auth
            }, {timeout: 120000})
              .as('ProcessingPreviewPage');

            cy.intercept({
              method: 'PATCH',
              url: `/api/dojo/models/${modelId}`,
              auth
            }).as('SaveModelAnnotations');

            cy.intercept({
              method: 'POST',
              url: 'api/dojo/dojo/outputfile',
              auth
            }).as('CreateOutputFile');

            cy.findAllByRole('button', {name: /submit to dojo/i})
              .eq(1)
              .click();

            cy.get('@CreateOutputFile').should((intercept) => {
              expect(intercept.response.body).to.include(modelId);
            });

            cy.get('@SaveModelAnnotations').should((intercept) => {
              expect(intercept.request.body.outputs[0].name).to.equal('value');
            });

          });
        });
      });
  });
});


describe('Model Annotate directive', { browser: ['chrome', 'chromium', 'firefox'] }, () => {

  let modelId;

  afterEach(() => {
    cleanModel(modelId);
  });

  it('Opens panel to annotate directive', () => {

    const testModel = genBaseModel(modelId);
    modelId = testModel.id;

    cy.seed({type: 'model', data: testModel})
      .then(() => {
        cy.wrap(provisionTerminalWaitReady(modelId)).then(() => {

          const fileName = 'output_data.csv';
          const folderName = 'testmodel';
          const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

          cy.visit(`/term/${testModel.id}`, {auth});

          cy.reload();

          cy.findByRole('textbox', {name: /terminal input/i})
            .type(`mkdir ${folderName}{enter}`)
            .type(`cd ${folderName}{enter}`)
            .type(`touch ${fileName}{enter}`)
            .type(`cat ${fileName}{enter}`);

          cy.readFile('cypress/files/sample_output.csv').then((contents) => {
            return cy.request({
              method: 'POST',
              url: saveUrl,
              body: contents,
              auth
            });
          }).then(() => {

            cy
              .findByRole('table', {name: /enhanced table/i})
              .findAllByRole('button', {name: /mark as directive/i})
              .last()
              .click();

            cy.wait(1000);

            cy.findByRole('dialog')
              .findByText(`cat ${fileName}`);

          });

        });
      });
  });
});


describe('Model listings', { browser: ['chrome', 'chromium', 'firefox'] }, () => {

  let testModel;
  let modelId;

  before(() => {
    testModel = genBaseModel(modelId);
    modelId = testModel.id;
    cy.seed({type: 'model', data: testModel});
  });

  after(() => {
    cleanModel(modelId);
  });

  it('Existing model is found in Model List page', () => {

    cy.visit('/models', {auth});

    cy.get('[data-test=viewModelsSearchField]', { timeout: 10000 }).type(testModel.name);

    cy.findAllByRole('row')
      .eq(1)
      .as('ResultDataRow');

    cy.get('@ResultDataRow')
      .contains(testModel.name);
  });
});


describe('Model metadata form state navigation', { browser: ['chrome', 'chromium', 'firefox'] }, () => {

  it('Keeps state when navigating away and then back', () => {
    cy.visit('/', {auth});
    cy.get('[data-test=landingPageModelForm]').click();
    cy.get('[data-test=modelForm-name]').type(modelName);
    cy.get('[data-test="modelForm-maintainer.website"]').clear().type('http://jataware.com');
    cy.get('[data-test=modelForm-family_name]').type('Test Family Name');
    cy.get('[data-test=modelForm-description]')
      .type('This is a test description. It is long enough.');
    cy.contains('This is a test description.');
    cy.get('[data-test=modelFormOverviewNextBtn]').click();

    // detail form
    cy.get('[data-test="modelForm-maintainer.name"]').type('Maintainer Test Name');
    cy.get('[data-test="modelForm-maintainer.email"]').type('test@example.com');
    cy.get('[data-test="modelForm-maintainer.organization"]')
      .type('Maintainer Test Organization');

    // wait for 1s here as we have a timeout built in to save the form state
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    // navigate as if we've hit the browser's back button
    cy.go('back');

    // navigate back to the model form
    cy.get('[data-test=landingPageModelForm]').click();
    // check that the continuing dialog is there
    cy.contains('Continuing from where you left off.');

    // check that at least one of our previous values are there
    cy.get('[data-test=modelFormDetailBackBtn]').click();
    cy.contains('This is a test description.');

    // clear the form
    cy.get('[data-test=stepperResetButton').click();
    cy.get('[data-test=confirmDialogYes').click();
    // and check that the first value is empty
    cy.get('[data-test=modelForm-name]').should('have.value', '');
  });
});


describe('Model Summary Page', { browser: ['chrome', 'chromium', 'firefox'] }, () => {

  let modelId = undefined;

  after(() => {
    cleanModel(modelId);
  });

  it('All required Model properties are displayed on page', () => {

    // NOTE Force a modelId here and remove cleanup fns to reuse same model
    //      across debugging sessions
    // modelId = 'acab2a55-8356-4029-99c2-734b4939293e';

    const testModel = genBaseModel(modelId, 'base', {});

    modelId = testModel.id;

    cy.seed({type: 'model', data: testModel})
      .then(() => {

        cy.wrap(provisionTerminalWaitReady(modelId))
          .then(() => {
            const fileName = 'output_data.csv';
            const folderName = 'testmodel';
            const user = 'clouseau';
            const homeDir = `/home/${user}`;
            const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

            cy.visit(`/term/${testModel.id}`, {auth});

            cy.reload();

            cy.wait(2000);

            cy.findByRole('textbox', {name: /terminal input/i})
              .type(`mkdir ${folderName}{enter}`)
              .type(`cd ${folderName}{enter}`)
              .type(`touch ${fileName}{enter}`)
              .type(`touch parameters.json{enter}`)
              .type(`touch accessory.png{enter}`)
              .type('cd ..{enter}')
              .type(`cat ${folderName}/${fileName}{enter}`);

            cy.log('Uploading output file seed.');

            cy.readFile('cypress/files/sample_output.csv').then((contents) => {
              return cy.request({
                method: 'POST',
                url: saveUrl,
                body: contents,
                auth
              });
            });

            const urls = getModelRegisterUrls(modelId, {homeDir, user, fileName, folderName, saveUrl});

            cy.log('Wait for all seed URLs to finish processing.');

            cy.wrap(waitForAllUrlsToFinish(urls))
              .then(() => {

                cy.wrap(waitUrlToProcess(`/api/dojo/dojo/config/${modelId}`, '[0]'))
                  .then(() => {

                    cy.findByRole('button', {name: /save and continue/i})
                      .click();

                    cy.findByText(/Uploading Model to Docker.+/i);

                    cy.reload();

                    cy.log('Verify all regions are populated on summary.');

                    cy.findByRole('heading', {name: /parameters\.json/i});
                    cy.findAllByRole('heading', {name: /accessory\.png/i});
                    cy.findAllByRole('heading', {name: /Test-Output-Name/i});
                  });

              });
          });
      });
  });
});
