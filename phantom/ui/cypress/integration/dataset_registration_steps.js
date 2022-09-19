
/**
 *
 **/
function mockHttpRequests() {

  cy.intercept({
    method: 'GET',
    url: '/api/dojo/*/domains*'
  }, {
    fixture: 'domains_get.json'
  });

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators'
  }, {
    fixture: 'indicators_post.json'
  });

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators/*/upload*'
  }, {
    "id": "test-guid",
    "filename": "raw_data.csv"
  });

  cy.intercept({
    method: 'PATCH',
    url: '/api/dojo/indicators/*/annotations'
  }, "Updated annotation with id = test-guid");

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/job/*/file_processors.file_conversion*'
  }, {
    fixture: 'file_conversion_post.json'
  });

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/job/*/geotime_processors.geotime_classify*'
  }, {fixture: 'geotime_classify_post.json'});

  cy.intercept({
    method: 'GET',
    url: '/api/dojo/indicators/*/annotations*'
  }, {fixture: 'indicators_annotations_get.json'});

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators/*/preview/raw*'
  }, {fixture: 'indicators_preview_raw_post.json'});

  cy.intercept({
    url: 'api/dojo/job/*/mixmasta_processors.run_mixmasta*',
    method: 'POST'
  }, {fixture: 'mixmasta_processors.run_mixmasta_post.json'});

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators/*/preview/raw*'
  }, {fixture: 'indicators_preview_raw_post.json'});

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators/*/preview/processed*'
  }, {fixture: 'indicators_preview_processed_post.json'});

  cy.intercept({
    method: 'PUT',
    url: '/api/dojo/indicators/*/publish*'
  }, {});

  cy.intercept(
    'PUT',
    '/api/dojo/indicators',
    {});

  cy.intercept(
    'PATCH',
    '/api/dojo/indicators*',
    {});

  cy.intercept({
    url:'/api/dojo/indicators/*/verbose*',
    method: 'GET'
  }, {fixture: 'indicators_verbose_get.json'});

}

describe('Dataset Register Flow', function () {

  beforeEach(() => {
    cy.intercept(
      '/api/**/*',
      { middleware: true },
      (req) => {
        req.on('before:response', (res) => {
          // force all API responses to not be cached during testing! Ugh
          res.headers['cache-control'] = 'no-store';
        });
      }
    );
  });

  it('Happy path: Goes through from Metadata page until success page with mocked requests', function () {

    mockHttpRequests();

    cy.visit('/datasets/register');

    /* QUERIES */

    cy.findByRole('textbox', {name: /^Name/i}).as('DatasetName');
    cy.findByRole('textbox', {name: /Description/i}).as('DatasetDescription');

    // Don't necessarily have to use test-id here, as increasing the timeout worked
    cy.findByTestId('file-upload-input', { timeout: 10000 }).as('FileUpload');
    cy.findByRole('combobox').as('DomainsSelector'); // also found as an input with name attr
    cy.findAllByRole('textbox', {name: /Registerer Name \(Organization\)/i}).as('RegistererName');
    cy.findAllByRole('textbox', {name: /Registerer Email/i}).as('RegistererEmail');
    cy.findAllByRole('button', {name: /Next/i}).as('NextButton');

    // ACTIONS

    cy.get('@FileUpload').selectFile({
      contents: 'cypress/fixtures/dummy.csv',
      fileName: 'dummy.csv'
    }, {allowEmpty: true, force: true});

    cy.get('@DatasetName').type('Dataset Name X');
    cy.get('@DatasetDescription').type('A sample description for a glorious test');

    cy.get('@DomainsSelector').type('Mathematics');
    cy.findByRole('listbox').click();

    cy.get('@RegistererName').type('SKYNET');
    cy.get('@RegistererEmail').type('ai-test-bot@jataware.com');

    // Submit / navigate to next
    cy.get('@NextButton').click();

    cy.url().should('match', /datasets\/register\/analyze\/.+\?filename=raw_data.csv/);

    // couple of seconds later (mocked runJob response; quick):
    cy.url().should('match', /datasets\/register\/annotate\/.+\?filename=raw_data.csv/);

    // Annotate page selectors
    cy.findAllByRole('button', {name: /Annotate/i}).as('AnnotateButtons');


    // Annotate page actions

    // ====== Annotate the date column ==============
    cy.findByText('date').click();

    cy.findAllByRole('button', {name: /type/i}).click();

    cy.findByRole('option', {name: /Date/i}).click();

    cy.findByRole('checkbox', {name: /This is my primary date field This is my primary date field/i}).click();

    cy.findByRole('textbox', {name: /Description/i})
      .type('sample column description for a date');

    cy.findAllByRole('button', {name: /save/i}).click();

    // ========== Annotate the value column as feature =============

    cy.findByText('value').as('ValueColumnLabel');

    cy
      .get('@ValueColumnLabel')
      .siblings('div')
      .findByText('inferred')
      .should('exist');

    cy.get('@ValueColumnLabel')
      .click();

    cy.findAllByRole('button', {name: /type/i}).click();

    cy.findByRole('option', {name: /Feature/i}).click();

    cy.findAllByRole('textbox', {name: /^Description/i})
      .type('sample column description for a date');

    cy.findByRole('textbox', {name: /^units/i})
      .type('m');

    cy.findAllByRole('button', {name: /save/i}).click();

    // READY TO SUBMIT ANNOTATE step

    cy.findAllByRole('button', {name: /^Next$/i}).click();


    cy.url().should('match', /datasets\/register\/process\/.+\?filename=raw_data.csv/);

    cy.url().should('match', /datasets\/register\/preview\/.+\?filename=raw_data.csv/);

    cy.findAllByRole('button', {name: /^submit to dojo$/i, timeout: 1000}).click();

    // ASSERTIONS

    cy.url().should('match', /datasets\/register\/submit\/.+\?filename=raw_data.csv/);

    cy.findByText(/Your dataset has been successfully registered/i).should('exist');

  });

  it('Starts from Annotate page, navigates back, then clicks next without changing anything', function () {

    mockHttpRequests();

    const createDatasetSpy = cy.spy().as('onCreateSpy');
    const updateDatasetSpy = cy.spy().as('onUpdateSpy');
    const uploadFileSpy = cy.spy().as('uploadFileSpy');

    cy.intercept(
      'POST',
      '/api/dojo/indicators',
      (req) => {
        // This SHOULD NOT BE CALLED (no create, but update)

        assert.equal(req.method, 'POST');
        // assert.equal(req.body.id, 'test-guid');

        createDatasetSpy();

        req.reply({
          statusCode: 400,
          body: {}
        });

      });

    cy.intercept(
      'PATCH',
      '/api/dojo/indicators?*',
      (req) => {
        // This should be called
        assert.equal(req.method, 'PATCH');
        assert.equal(req.body.id, 'test-guid');

        updateDatasetSpy();

        req.reply({
          statusCode: 200,
          body: {}
        });
      });

    cy.intercept(
      'POST',
      '/api/dojo/indicators/*/upload',
      (req) => {

        uploadFileSpy();

        return {
          "id": "test-guid",
          "filename": "raw_data.csv"
        };
      });

    cy.visit('/datasets/register/annotate/test-guid?filename=raw_data.csv');

    cy.findAllByRole('button', {name: /^Back$/i}).click();

    cy.url().should('match', /datasets\/register\/register\/.+\?filename=raw_data.csv/);

    cy.findByRole('textbox', {name: /^Name/i})
      .should('have.value', 'A better name');

    cy.findByRole('textbox', {name: /Description/i})
      .should('have.value', 'A description, yo!');

    cy.findByRole('combobox')
      .findByText(/Earth and Space Sciences/i);

    cy.findAllByRole('textbox', {name: /Registerer Name \(Organization\)/i})
      .should('have.value', 'Joel');

    cy.findAllByRole('textbox', {name: /Registerer Email/i})
      .should('have.value', 'joel@jataware.com');

    cy.findByText('output_0.9_1.2.csv');
    cy.findByRole('button', {name: /replace/i});

    cy.findByRole('button', {name: /Next/i}).click();

    cy.url().should('match', /datasets\/register\/analyze\/.+\?filename=raw_data.csv/);


    cy.get('@onCreateSpy').should('not.have.been.called');
    cy.get('@onUpdateSpy').should('have.been.called');
    cy.get('@uploadFileSpy').should('not.have.been.called');

  });

  it('Starts from the register page of an existing dataset, modifies name and file, then navigates next', function () {

    mockHttpRequests();

    const updateDatasetSpy = cy.spy().as('onUpdateSpy');
    const uploadFileSpy = cy.spy().as('uploadFileSpy');

    cy.intercept({
      url:'/api/dojo/indicators/*/verbose',
      method: 'GET'
    }, {fixture: 'indicators_verbose_get.json'});

    cy.intercept(
      'PATCH',
      '/api/dojo/indicators?*',
      (req) => {
        // This should be called
        assert.equal(req.method, 'PATCH');
        assert.equal(req.body.id, 'test-guid');

        updateDatasetSpy(req.body.name);

        req.reply({
          statusCode: 200,
          body: {}
        });
      });

    cy.intercept(
      'POST',
      '/api/dojo/indicators/*/upload',
      (req) => {

        uploadFileSpy(req.body.includes('dummy.csv'));

        return {
          "id": "test-guid",
          "filename": "raw_data1.csv"
        };
      });

    cy.visit('/datasets/register/register/test-guid?filename=raw_data.csv');

    cy.findByRole('textbox', {name: /^Name/i}).as('DatasetNameField');

    cy.get('@DatasetNameField')
      .should('have.value', 'A better name');

    cy.get('@DatasetNameField')
      .clear()
      .type('An updated name');

    cy.findByRole('textbox', {name: /Description/i})
      .should('have.value', 'A description, yo!');

    cy.findAllByRole('textbox', {name: /Registerer Name \(Organization\)/i})
      .should('have.value', 'Joel');

    cy.findByText('output_0.9_1.2.csv');

    cy.findByText(/replace/i).click();

    cy.findByTestId('file-upload-input', { timeout: 1000 })
      .selectFile({
        contents: 'cypress/fixtures/dummy.csv',
        fileName: 'dummy.csv'
      }, {allowEmpty: true});

    cy.findByRole('button', {name: /Next/i}).click();

    cy.get('@onUpdateSpy').should('have.been.calledWith', 'An updated name');
    cy.get('@uploadFileSpy').should('have.been.calledWith', true);

    cy.url().should('match', /datasets\/register\/analyze\/.+\?filename=raw_data.csv/);
  });

});
