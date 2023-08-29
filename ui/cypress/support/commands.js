// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('selection', { prevSubject: true }, (subject, fn) => {
  cy.wrap(subject)
    .trigger('mousedown')
    .then(fn)
    .trigger('mouseup');

  cy.document().trigger('selectionchange');
  return cy.wrap(subject);
});

function setBaseAndExtent(...args) {
  const document = args[0].ownerDocument;
  document.getSelection().removeAllRanges();
  document.getSelection().setBaseAndExtent(...args);
}

function getTextNode(el, match) {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  if (!match) {
    return walk.nextNode();
  }

  let node;
  while ((node = walk.nextNode())) {
    if (node.wholeText.includes(match)) {
      return node;
    }
  }
  return null;
}

// https://github.com/netlify/netlify-cms/blob/a4b7481a99f58b9abe85ab5712d27593cde20096/cypress/support/commands.js#L180
// allows us to highlight text when testing shorthand
Cypress.Commands.add('setSelection', { prevSubject: true }, (subject, query, endQuery) => (

  cy.wrap(subject).selection(($el) => {

    if (typeof query === 'string') {
      const anchorNode = getTextNode($el[0], query);
      const focusNode = endQuery ? getTextNode($el[0], endQuery) : anchorNode;
      const anchorOffset = anchorNode.wholeText.indexOf(query);
      const focusOffset = endQuery
        ? focusNode.wholeText.indexOf(endQuery) + endQuery.length
        : anchorOffset + query.length;
      setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    } else if (typeof query === 'object') {
      const el = $el[0];
      const anchorNode = getTextNode(el.querySelector(query.anchorQuery));
      const anchorOffset = query.anchorOffset || 0;
      const focusNode = query.focusQuery
        ? getTextNode(el.querySelector(query.focusQuery))
        : anchorNode;
      const focusOffset = query.focusOffset || 0;
      setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    }
  })
));


const username = Cypress.env('DOJO_DEMO_USER');
const password = Cypress.env('DOJO_DEMO_PASS');
const hasAuth = Boolean(username) && Boolean(password);
const auth = hasAuth ? {username, password} : undefined;


/**
 *
 * Set the following OS env vars for cypress to use below:
 * `CYPRESS_DOJO_DEMO_USER`
 * `CYPRESS_DOJO_DEMO_PASS`
 * Cypress removes the leading CYPRESS_ when we retrieve in code:
 **/
Cypress.Commands.add('login', () => {

  if (!hasAuth) {
    return Cypress.Promise.resolve(false);
  }

  cy.visit('/', {auth});

});




Cypress.Commands.add('seed', ({type, data, id, method='POST'}) => {

  const hasAuth = Boolean(username) && Boolean(password);

  let uri = ''; // Replace with your API base URL

  if (type === 'dataset') {
    uri = 'indicators';
  }
  else if (type === 'model') {
    if (method === 'PATCH') {
      uri = `models/${id}`;
    } else {
      uri = 'models';
    }
  } else if (type === 'annotation') {
    uri = `indicators/${id}/annotations`;
  }

  // NOTE cy.request here makes sense (from feedback).
  // Seed the database using cy.request
    const cy_promise = cy.request({
      method,
      url: `/api/dojo/${uri}`,
      auth,
      body: data
    });

  return cy_promise;
});


Cypress.Commands.add("uploadFile", ({type, id, variant}) => {

  const hasAuth = Boolean(username) && Boolean(password);

  if (type === 'dataset') {

    cy.log('Uploading dataset seed-file.')

    // NOTE For now ignore variant since this is used once.

    const fileName = 'raw_data.csv';
    const url = `/api/dojo/indicators/${id}/upload`;

    return cy.readFile(`cypress/files/${fileName}`)
      .then(Cypress.Blob.binaryStringToBlob)
      .then((blob) => {

        const formData = new FormData();
        const file = new File([blob], fileName);
        formData.append('file', file);
        formData.append('filename', fileName);

        return cy.request({
          method: 'POST',
          url: url,
          body: formData,
          auth
        })
      });

  }

  return undefined; // Test will error if not for datasets for now

});
