// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';

before(() => {
  cy.log('Visit / with auth to log in.');
  cy.login();
});

Cypress.on('uncaught:exception', (err, runnable) => {
  // If an inconsequential http request is done and not mocked
  // ignore and continue test without failing
  return false;
});

