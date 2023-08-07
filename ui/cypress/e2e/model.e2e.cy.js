import 'cypress-iframe';
import { genBaseModel, generatedIDs } from '../seeds/model_api_data';

const date = Date.now().toString();
const directiveCmd = `run file.txt --data=${date}`;
const modelName = `TestModel_created_at=${date}`;

describe('Creating a model up to terminal step', () => {
  /* use this to reconnect between tests (if developing in terminal) */
  // beforeEach(() => {
  //   cy.visit('/admin');
  //   cy.get('[data-test=adminReconnectLink]').click();
  // });

  /* this will fail gracefully if there isn't a worker running to shut down */
  const shutdownWorker = () => {
    /* give the shutdown endpoint an alias so we can know when it is complete */
    cy.intercept('/api/terminal/docker/*/release').as('shutdown');
    cy.visit('/admin');
    /* find our shutdown button */
    cy.get('[data-test=adminShutDownBtn]', {timeout: 15000}).then((btn) => {
      /* if it's not disabled */
      if (!btn[0].disabled) {
        /* wrap the returned button in a promise (necessary inside the .then) and click it */
        cy.wrap(btn).click();
        /* and wait for the shutdown endpoint to return */
        cy.wait('@shutdown', { timeout: 300000 });
      }
    });
  };

  /* shut before each tests, if we leave a model running */
  beforeEach(shutdownWorker);

  after(() => {
    shutdownWorker();

    console.log('TODO Cleaning up seed test model:', modelName);
    // TODO this cleans the model, but can leave a lock behind for a container
    // which makes the /admin urls /locks endpoint break and breaks system.
    // Debug later and clean up models here.
    // cy.task('seed:clean', {type: 'model', name: modelName});
  });

  it('Creates a model with all the metadata fields and just the basic terminal steps', () => {
    cy.visit('/');
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
    cy.get('[data-test=modelFormStartDate]').type('01/01/2030');
    cy.get('[data-test=modelFormEndDate]').type('01/01/2040');

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

    // watch for our requests for the shell history, so we know when we get the new directive
    cy.intercept('/api/dojo/terminal/container/history/*').as('shellHistory');

    // type in a directive
    cy.get('.xterm-helper-textarea').type(`${directiveCmd}{enter}`);

  });

});

describe('Model templater annotations', () => {
  // TODO plan how to reuse a terminal session for the below?

  xit('Can use Templater to annotate a config file');

  xit('Can use Templater to annotate a directive parameter');
});

describe.only('Model output annotation', () => {

  it('Can annotate model output', () => {

    const testModel = genBaseModel('acb7c12a-4938-4c48-9e84-21cb7a8b6c6c'); // force this id for now

    // TODO this is commented to reuse the same model while developing
    // cy.request('post', '/api/dojo/models', testModel)
    //   .its('body').should('include', testModel.id); // this waits for the model

    // TODO this should only be created when not running already, which we wont do
    // while developing tests
    // cy.request('POST', `/api/terminal/docker/provision/${testModel.id}`, {
    //   "name": testModel.id,
    //   "image": "jataware/dojo-publish:Ubuntu-latest",
    //   "listeners": []
    // })
    //   .its('body').should('include', `Processing ${testModel.id}`)

    // http://localhost:8080/api/terminal/docker/provision/acb7c12a-4938-4c48-9e84-21cb7a8b6c6c

    cy.visit(`/term/${testModel.id}`);

    cy.wait(2000);

    cy.findByRole('textbox', {name: /terminal input/i})
      .type('mkdir testmodel{enter}')
      .type('cd testmodel{enter}')
      .type('touch output_data.csv{enter}')
      .type('dojo edit output_data.csv{enter}');

    cy.findByRole('button', {name: 'close'}); // data-test=fullScreenDialogCloseBtn

    cy.findByRole('textbox').as('EditingText');

    cy.get('@EditingText')
      .type('latitude,longitude,date,value,color_hue{enter}');

    cy.wait(10);

    cy.get('@EditingText')
      .type('60.4985255,-10.615118,1986-07-31,0.1237884593924997,#a04620{enter}')
      .type('28.5827915,-103.818624,2019-09-25,0.8583255955703992,#c61352{enter}')
      .type('-73.3958715,141.932549,1972-05-30,1.137030617734822,#f77bad{enter}')
      .type('62.866798,-57.143830,1993-07-11,1.917793049098565,#ea6b81{enter}')
      .type('-85.861143,-67.704187,2018-05-24,1.5932706382475221,#b2254d{enter}')
      .type('-0.0828935,143.074336,2016-04-29,0.6276615872169006,#962d00{enter}')
      .type('31.704198,65.765472,1979-01-10,0.03205149393145829,#fcc4d0{enter}')
      .type('-23.5363155,66.668348,1979-09-06,1.8721222284406769,#ef260b{enter}')

    cy.findByRole('button', {name: /save/i})

  });

  const shutdownWorker = () => {
    /* give the shutdown endpoint an alias so we can know when it is complete */
    cy.intercept('/api/terminal/docker/*/release').as('shutdown');
    cy.visit('/admin');
    /* find our shutdown button */
    cy.get('[data-test=adminShutDownBtn]', {timeout: 15000}).then((btn) => {
      /* if it's not disabled */
      if (!btn[0].disabled) {
        /* wrap the returned button in a promise (necessary inside the .then) and click it */
        cy.wrap(btn).click();
        /* and wait for the shutdown endpoint to return */
        cy.wait('@shutdown', { timeout: 300000 });
      }
    });
  };

  // beforeEach(shutdownWorker);
  // after(shutdownWorker);

  // xit('Can annotate model output: annotate (step 2)');
});

describe('Model listings', () => {

  const testModel = genBaseModel();

  before(() => {
    cy.request('post', '/api/dojo/models', testModel)
      .its('body').should('include', testModel.id);

    // cy.wait(300);
  });

  after(() => {
    console.log('Cleaning up seed test model:', testModel.id);
    console.debug('generatedIDs', generatedIDs);
    cy.task('seed:clean', {type: 'model', id: testModel.id});
  });

  xit('Visits an existing model and does more things in the terminal');

  it('Existing model is found in Model List page', () => {

    cy.visit('/models');
    // cy.task('seed', 'models-registered');

    cy.get('[data-test=viewModelsSearchField]', { timeout: 10000 }).type(testModel.name);

    cy.findAllByRole('row')
      .eq(1)
      .as('ResultDataRow');

    cy.get('@ResultDataRow')
      .contains(testModel.name);
  });
});

describe('Model metadata form state navigation', () => {
  it('Keeps state when navigating away and then back', () => {
    cy.visit('/');
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


describe('Model Summary Page Actions', () => {

  xit('All required Model properties are displayed on page');

  xit('Can start edit/re-publish Model process');
});
