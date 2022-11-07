

/**
 *
 **/
function mockHttpRequests() {

  cy.intercept({
    method: 'GET',
    url: '/api/dojo/*/domains*'
  }, {
    fixture: 'domains_get.json'
  }).as('DomainsStub');

  cy.intercept({
    url:'/api/dojo/indicators/*/verbose*',
    method: 'GET'
  }, {fixture: 'indicators_verbose_get.json'}).as('DatasetVerboseStub');

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators/*/upload*'
  }, {
    "id": "test-guid",
    "filename": "raw_data_3.csv"
  }).as('DatasetFileUploadStub');

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
    url: 'api/dojo/job/*/mixmasta_processors.run_mixmasta*',
    method: 'POST'
  }, {fixture: 'mixmasta_processors.run_mixmasta_post.json'});

  cy.intercept(
    'PUT',
    '/api/dojo/indicators',
    {});

  cy.intercept(
    'PUT',
    '/api/dojo/indicators*',
    {});

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators/*/preview/processed*'
  }, {fixture: 'indicators_preview_processed_post.json'}).as('PreviewProcessedStub');

  cy.intercept({
    method: 'PUT',
    url: '/api/dojo/indicators/*/publish*'
  }, {});
}


describe('Dataset Append Flow', function () {

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

  it('Happy path: Goes through from Metadata page to success page wich mocked requests', function () {

    mockHttpRequests();

    cy.wait(15);

    cy
      .visit('/datasets/append/register/test-guid');

    cy
      .findAllByRole('button', {name: /Next/i})
      .as('NextButton');

    cy
      .findByTestId('file-upload-input', { timeout: 1000 })
      .selectFile({
        contents: 'cypress/fixtures/dummy.csv',
        fileName: 'dummy.csv'
      }, {allowEmpty: true});

    cy
      .get('@NextButton')
      .click();

    cy.wait(50);

    cy.url().should('match', /datasets\/append\/preview\/.+\?filename=raw_data_3.csv/);

    cy
      .findAllByRole('button', {name: /^submit to dojo$/i, timeout: 1000})
      .click();

    cy.wait(50);

    cy.url().should('match', /datasets\/append\/submit\/.+\?filename=raw_data_3.csv/);

    cy
      .findByText(/Your dataset has been successfully registered/i)
      .should('exist');

  });

it('Starts from Preview page from previously uplaoded file, navigates back, then clicks next without changing anything', function () {

  mockHttpRequests();

  cy.wait(15);

  cy.visit('/datasets/append/preview/test-guid?filename=raw_data.csv');

  cy.findAllByText(/timestamp/i); // Wait for the table to load

  cy.findAllByRole('button', {name: /^Back$/i}).click();

  cy.url().should('match', /datasets\/append\/upload\/.+\?filename=raw_data.csv/);

  // also find uplaoed file
  cy.findByText(/uploaded filename/i);
  cy.findByText(/output_0.9/i);

  cy.findAllByRole('button', {name: /^Next$/i}).click();

  cy.url().should('match', /datasets\/append\/preview\/.+\?filename=raw_data.csv/);

  });


});
