describe('ModelRuns List', function () {

  before(function () {
    cy.fixture('modelruns.json')
      .then((runs) => {
        cy.intercept('/api/dojo/runs', { body: {results: runs} });
        cy.visit('/runs');
      });
  });

  context('All Model Runs Listings page', function () {

    it('Display columns and values', function () {

      cy.findAllByRole('row').as('rows');
      cy.findAllByRole('columnheader').as('columns');
      cy.findAllByRole('alert').as('alerts');

      cy.get('@rows').should('have.length', 5); // Header row + modelruns mocked (4)
      cy.get('@columns').should('have.length', 7);
      cy.get('@columns').eq(0).should('have.text', 'ID');

      cy.get('@alerts').eq(0).should('have.text', 'Success');
      cy.get('@alerts').eq(1).should('have.text', 'Failed');
      cy.get('@alerts').eq(2).should('have.text', 'Running');
      cy.get('@alerts').eq(3).should('have.text', 'Queued');

    });

    it('Allows filtering table', function () {

      cy.findByRole('searchbox').as('search');
      cy.findAllByRole('row').as('rows');

      cy.get('@search').should('have.length', 1);
      cy.get('@rows').should('have.length', 5); // Header row + modelruns mocked (4)

      cy.get('@search').type('mocked');

      cy.get('@rows').should('have.length', 2);
      cy.findAllByRole('cell').eq(0).should('include.text', 'foo-test-mocked-');

    });

  });
});

const modelRuns = require("../fixtures/modelruns.json");

describe(`Summary Page for Model Runs`, function () {

  modelRuns.forEach(run => {

    context(`Status: ${Cypress._.get(run, 'attributes.status', 'queued')}`, function () {

      before(function () {
        cy.intercept({ method: 'GET', url: '/api/dojo/runs/*' }, run);
        cy.visit('/runs/fooStubbed');
      });

      const isCompleted = ['success', 'failed'].includes(run.attributes.status);

      it('Verify sample attributes', function () {
        cy.findAllByRole('region', {name: /Attributes/i})
          .as('AttributesRegion');

        cy.get('@AttributesRegion')
          .contains(run.id);

        cy.get('@AttributesRegion')
          .contains(run.model_id);

        cy.findAllByRole('heading', {name: /temperature/i})
          .siblings()
          .should('have.text', run.parameters[0].value);
      });

      it('Refresh Status button available for not completed runs', () => {
        if (!isCompleted) {
          cy.findAllByRole('button')
            .contains('REFRESH');
        } else {
          cy.findByRole('button') // Find the one button
            .invoke('text')
            .should('match', /View Logs/i);
        }
      });

      it('Displays completed on', () => {
        cy.findByRole('heading', {name: /Completed On/i})
          .siblings()
          .as('completedOn');

        if (!isCompleted) {
          cy.get('@completedOn')
            .should('have.text', '-');
        } else {
          cy.get('@completedOn')
            .invoke('text')
            .should('match', /^2022.+/i);
        }
      });

      it('Verifies Data and Output Paths', function () {

        cy.findAllByRole('region', {name: /Data Paths/i})
          .as('DataPathsRegion');

        cy.findAllByRole('region', {name: /Output Paths/i})
          .as('OutputPathsRegion');

        if (run.id === 'foo-test-mocked-rerun') { // A run was forced to miss these properties
          cy.get('@DataPathsRegion')
            .contains('No Data Paths');

          cy.get('@OutputPathsRegion')
            .contains('No Output Paths');
        } else {
          cy.get('@DataPathsRegion')
            .findAllByRole('link')
            .first()
            .should('include.text', 'parquet.gzip');

          cy.get('@OutputPathsRegion')
            .findAllByRole('link')
            .first()
            .should('include.text', 'lime-cat');
        }
      });

    });

  });
});

