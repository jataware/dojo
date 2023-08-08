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

describe('Model output annotation', () => {

  it('Creates a file and edits with dojo edit', () => {

    let modelId = undefined;
    const testModel = genBaseModel(modelId);

    modelId = testModel.id;

    cy.request('post', '/api/dojo/models', testModel)
      .its('body').should('include', testModel.id);

    cy.request('POST', `/api/terminal/docker/provision/${testModel.id}`, {
      "name": testModel.id,
      "image": "jataware/dojo-publish:Ubuntu-latest",
      "listeners": []
    })
      .its('body').should('include', `Processing ${testModel.id}`);

    cy.wait(10000);

    cy.visit(`/term/${testModel.id}`);

    const fileName = 'output_data.csv';
    const folderName = 'testmodel';

    cy.findByRole('textbox', {name: /terminal input/i})
      .type(`mkdir ${folderName}{enter}`)
      .type(`cd ${folderName}{enter}`)
      .type(`touch ${fileName}{enter}`)
      .type(`dojo edit ${fileName}{enter}`);

    cy.findByRole('button', {name: 'close'});

    cy.findByRole('textbox').as('EditingText');

    cy.get('@EditingText')
      .type('latitude,longitude,date,value,color_hue{enter}');

    cy.get('@EditingText')
      .type('60.4985255,-10.615118,1986-07-31,0.1237884593924997,#a04620{enter}28.5827915,-103.818624,2019-09-25,0.8583255955703992,#c61352{enter}28.5827915,-103.818624,2019-09-25,0.8583255955703992,#c61352{enter}-73.3958715,141.932549,1972-05-30,1.137030617734822,#f77bad{enter}62.866798,-57.143830,1993-07-11,1.917793049098565,#ea6b81{enter}', {force: true} );

    const saveUrl = `/api/terminal/container/${modelId}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

    cy.intercept('POST', saveUrl).as('SavingNewFile');

    cy.findByRole('button', {name: /save/i})
      .click();

    cy.get('@SavingNewFile').then(({request, response}) => {
      expect(request.query.path).to.contain(fileName);
      expect(request.body).to.contain('latitude');
      expect(response.body).to.equal('ok');
    });

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

  beforeEach(shutdownWorker);
  afterEach(() => {
    cy.wait(3000);
    shutdownWorker();
  });

  it('Annotate model output', () => {

    let modelId = '57361222-0099-41a1-9f21-66767af50a2f'; // undefined;
    const testModel = genBaseModel(modelId);

    modelId = testModel.id;

    cy.request('post', '/api/dojo/models', testModel)
      .its('body').should('include', testModel.id);

    cy.request('POST', `/api/terminal/docker/provision/${testModel.id}`, {
      "name": testModel.id,
      "image": "jataware/dojo-publish:Ubuntu-latest",
      "listeners": []
    })
      .its('body').should('include', `Processing ${testModel.id}`);

    cy.wait(5000); // figure out how to make this stable.. wait for term to show up on cy.request?

    const fileName = 'output_data.csv';
    const folderName = 'testmodel';

    const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

    cy.visit(`/term/${testModel.id}`);

    cy.findByRole('textbox', {name: /terminal input/i})
      .type(`mkdir ${folderName}{enter}`)
      .type(`cd ${folderName}{enter}`)
      .type(`touch ${fileName}{enter}`)
      .type('cd ..{enter}');


    cy.readFile('cypress/files/sample_output.csv').then((contents) => {
      cy
        .intercept('POST', `/api/dojo/job/${modelId}/tasks.model_output_analysis`)
        .as('FilePreAnalysis');

      return cy.request('POST', saveUrl, contents);
    }).then(() => {

      cy.findByRole('textbox', {name: /terminal input/i})
        .type(`cd ${folderName}{enter}dojo annotate ${fileName}{enter}`);

      cy.findByRole('button', {name: /close/i});

      cy.findByRole('textbox', {name: /Name/i}).type('named!');

      cy.findByRole('textbox', {name: /Description/i}).type('desc');

      cy.findByRole('textbox', {name: /Domains/i}).type('Logic');

      // NOTE Protects against current bug / race-condition (can click next until processed ugh)
      cy.wait('@FilePreAnalysis');

      cy.findAllByRole('button', {name: /Next/i}).click();

      cy.findAllByRole('button', {name: /Annotate/i, timeout: 45000})
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

      // possible enhancement think about promises and discuss
      // cy.spyPoll('POST', `/api/dojo/job/${modelId}/elwood_processors.run_model_elwood`, 'status', 'finished');

      cy.intercept(`/api/dojo/indicators/${modelId}/preview/processed?filepath=model-output-samples/*.csv`, {timeout: 20000})
        .as('ProcessingPreviewPage');

      cy.intercept('PATCH', '/api/dojo/models/57361222-0099-41a1-9f21-66767af50a2f').as('SaveModelAnnotations');
      cy.intercept('POST', 'api/dojo/dojo/outputfile').as('CreateOutputFile');

      cy.findAllByRole('button', {name: /submit to dojo/i})
        .eq(1)
        .click();

      cy.get('@CreateOutputFile').should((intercept) => {
        expect(intercept.response.body).to.include(modelId);
      });

      cy.get('@SaveModelAnnotations').should((intercept) => {
        console.log('save model intercept', intercept);
        expect(intercept.request.body.outputs[0].name).to.equal('value');
      });

    });

  });
});

describe('Annotate directive', () => {

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

  beforeEach(shutdownWorker);
  afterEach(() => {
    cy.wait(3000);
    shutdownWorker();
  });

  it('Opens panel to annotate directive', () => {

    let modelId = '57361222-0099-41a1-9f21-66767af50a2f'; // undefined;
    const testModel = genBaseModel(modelId);

    modelId = testModel.id;

    cy.request('post', '/api/dojo/models', testModel)
      .its('body').should('include', testModel.id);

    cy.request('POST', `/api/terminal/docker/provision/${testModel.id}`, {
      "name": testModel.id,
      "image": "jataware/dojo-publish:Ubuntu-latest",
      "listeners": []
    })
      .its('body').should('include', `Processing ${testModel.id}`);

    cy.wait(5000); // figure out how to make this stable.. wait for term to show up on cy.request?

    const fileName = 'output_data.csv';
    const folderName = 'testmodel';

    const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

    cy.visit(`/term/${testModel.id}`);

    cy.findByRole('textbox', {name: /terminal input/i})
      .type(`mkdir ${folderName}{enter}`)
      .type(`cd ${folderName}{enter}`)
      .type(`touch ${fileName}{enter}`)

    cy.readFile('cypress/files/sample_output.csv').then((contents) => {
      return cy.request('POST', saveUrl, contents);
    }).then(() => {

    cy.findByRole('textbox', {name: /terminal input/i})
      .type(`cat ${fileName}{enter}`);

    cy
      .findByRole('table', {name: /enhanced table/i})
      .findAllByRole('button', {name: /mark as directive/i})
      .last()
      .click();

      cy.findByRole('dialog')
        .findByText(`cat ${fileName}`)

    });
  });
})



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
