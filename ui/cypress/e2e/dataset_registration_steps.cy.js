
import { gen_tranform_intercepts } from '../support/helpers';

const genTransformPairs = (dataset_id) => ([
  ['gadm_processors.resolution_alternatives', {
    id: `${dataset_id}_gadm_processors.resolution_alternatives`,
    result: {
      field: 'mockCountry',
      exact_match: [],
      fuzzy_match: [],
    }
  }],

  ['transformation_processors.restore_raw_file', {
    "message": "File not found, nothing was changed",
    "transformed":false
  }],
  ['resolution_processors.calculate_temporal_resolution', {
    "message": "Resolution calculated successfully",
    "resolution_result": {
      uniformity: 'PERFECT',
      "unit": "day",
      "resolution": 1,
      "error": 0
    }
  }],
  ['transformation_processors.get_unique_dates', {
    "message": "Unique dates list generated",
    "unique_dates": [
      2022
    ]
  }],
  ['transformation_processors.get_boundary_box', {
    "message": "Boundary box generated successfully",
    "boundary_box": {
      "xmin": -26.0423,
      "xmax": 15.3333,
      "ymin": 26.3539,
      "ymax": 57.7956
    }
  }],
  ['resolution_processors.calculate_geographical_resolution', {
    "message": "Resolution calculated successfully",
    "resolution_result": {
      "uniformity": "uniform",
      "unit": "country"
    }
  }],
  ['gadm_processors.all_gadm_values', ['mocked_countries']],
  ['transformation_processors.scale_time', {}]
]);

/**
 *
 **/
function mockHttpRequests() {

  const dataset_id = 'mock-test-guid';

  // Generate pair of jobs for transform jobname,result as defined above this fn
  genTransformPairs(dataset_id).forEach((testData, index) => {
    const [fetch_job, start_job] = gen_tranform_intercepts.apply(null, [dataset_id, ...testData]);
    cy.intercept(fetch_job[0], fetch_job[1]).as(fetch_job[2]);
    cy.intercept(start_job[0], start_job[1]).as(start_job[2]);
  });

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/job/clear/mock-test-guid'
  }, 'No job found for uuid = mock-test-guid');

  cy.intercept({
    method: 'GET',
    url: '/api/dojo/*/domains*'
  }, {
    fixture: 'domains_get.json'
  }).as('GET_domains');

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators'
  }, {
    fixture: 'indicators_post.json'
  }).as('POST_indicator');

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators/*/upload*'
  }, {
    "id": "mock-test-guid",
    "filename": "raw_data.csv"
  }).as('POST_file_upload');

  cy.intercept({
    method: 'PATCH',
    url: '/api/dojo/indicators/*/annotations'
  }, "Updated annotation with id = mock-test-guid").as('PATCH_annotations');

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/job/*/file_processors.file_conversion*'
  }, {
    fixture: 'file_conversion_post.json'
  }).as('POST_job_file_converstion');

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/job/*/geotime_processors.geotime_classify*'
  }, {fixture: 'geotime_classify_post.json'})
    .as('POST_job_geotime_classify');

  cy.intercept({
    method: 'GET',
    url: '/api/dojo/indicators/*/annotations*'
  }, {fixture: 'indicators_annotations_get.json'});

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators/*/preview/raw*'
  }, {fixture: 'indicators_preview_raw_post.json'});

  cy.intercept({
    url: 'api/dojo/job/*/elwood_processors.run_elwood*',
    method: 'POST'
  }, {fixture: 'elwood_processors.run_elwood_post.json'});

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

  cy.intercept({
    method: 'POST',
    url: '/api/dojo/indicators/validate_date'
  }, {valid: true});

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

  cy.intercept(
    'POST',
    'api/dojo/job/fetch/undefined',
    {}).as('POST_undefined_missing_mock_jobs_PLEASE_DEBUG');

  cy.intercept(
    'POST',
    '/api/dojo/job/mock-test-guid/elwood_processors.scale_features*',
    {
      "id": "mock-test-guid_elwood_processors.scale_features",
      "created_at": "2022-08-17T15:18:27.474601",
      "enqueued_at": "2022-08-17T15:18:27.475190",
      "started_at": "2022-08-17T15:18:27.518462",
      "status": "finished"
    });

}

/**
 * UI Integration tests for Happy Path on Dataset Registration
 * Can be run on CI, but stubs all interactions with the backend.
 **/
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

    cy.wait(200);

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

    // Annotate page selectors
    cy.findAllByRole('button', {name: /Edit/i}).as('EditButtons');

    // Annotate page actions

    // ====== Annotate the date column ==============
    cy.get('@EditButtons').eq(0)
      .click();

    cy.findAllByRole('button', {name: /^Type/i}).click();

    cy.findByRole('option', {name: /Date/i}).click();

    cy.findByRole('checkbox', {name: /This is my primary date field This is my primary date field/i}).click();

    cy.findByRole('textbox', {name: /Description/i})
      .type('sample column description for a date');

    cy.findAllByRole('button', {name: /save/i}).click();

    // ========== Annotate the value column as feature =============

    cy.get('@AnnotateButtons').eq(1).as('ValueColumnLabel');

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

    cy.wait(200)

    cy.findAllByRole('button', {name: /Adjust Temporal Resolution/i}).as('temporalResolutionButton');

    cy.get('@temporalResolutionButton').click();

    cy.findByTestId(/transform-select-temporal-resolution-aggregation-function/i).click();
    cy.findAllByRole('option').eq(0).click();

    cy.findByTestId(/transform-select-temporal-resolution-resolution/i).click();
    cy.findAllByRole('option').eq(0).click();

    cy.findAllByRole('button', {name: /save resolution/i}).click();


    cy.wait(100)

    // proceed after confirming Transformations:
    cy.findAllByRole('button', {name: /^Next$/i}).click();

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
        assert.equal(req.body.id, 'mock-test-guid');

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
          "id": "mock-test-guid",
          "filename": "raw_data.csv"
        };
      });

    cy.visit('/datasets/register/annotate/mock-test-guid?filename=raw_data.csv');

    cy.findAllByRole('button', {name: /^Back$/i}).click();

    cy.url().should('match', /datasets\/register\/register\/.+\?filename=raw_data.csv/);

    cy.findByRole('textbox', {name: /^Name/i})
      .should('have.value', 'A better name');

    cy.findByRole('textbox', {name: /Description/i})
      .should('have.value', 'A description, yo!');

    cy.get('[role="button"]')
      .find('.MuiChip-label').should('have.text', 'Earth and Space Sciences');

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
        assert.equal(req.body.id, 'mock-test-guid');

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
          "id": "mock-test-guid",
          "filename": "raw_data1.csv"
        };
      });

    cy.visit('/datasets/register/register/mock-test-guid?filename=raw_data.csv');

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
