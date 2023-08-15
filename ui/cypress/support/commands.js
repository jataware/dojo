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


// let sharedStatus = 0;

// Cypress.Commands.add('spyPoll', {}, (method, url, property, expectedVal, nth=0) => {

//   if (sharedStatus === 1) {
//     console.log('done by sharedStatus!', 'sharedStatus:', sharedStatus);
//     return true;
//   }

//   let tryNum = nth + 1;
//   console.log('invoked spyPoll with args', expectedVal, 'tryNum:', tryNum);

//   const interceptName =`JobCheck`;
//   cy.intercept(method, url).as(interceptName);

//   return cy.wait(`@${interceptName}`)
//     .then((inter) => {
//       console.log('status:', inter.response.body[property]);

//       if (![expectedVal, 'errored'].includes(inter.response.body[property]) || sharedStatus !== 1) {
//         console.log('retrying...');
//         cy.wait(8000);
//         return cy.spyPoll(method, url, property, expectedVal, tryNum);
//       } else {
//         sharedStatus = 1;
//         console.log('done by expected state!', 'sharedStatus:', sharedStatus);
//         return true;
//       }
//     });
//  });

/**
 *
 * Set the following OS env vars for cypress to use below.
 * Cypress auto camelCases and remoced the leading cypress_:
 * `cypress_dojo_demo_user`
 * `cypress_dojo_demo_pass`
 **/
Cypress.Commands.add('login', () => {
  // (you can use the authentification via API request)

  console.log('cy env w/ regular:', Cypress.env('dojo_demo_user'));

  const user = Cypress.env('dojo_demo_user');
  const pass = Cypress.env('dojo_demo_pass');

  console.log('demo env?:', user, pass);

  const hasAuth = Boolean(user) && Boolean(pass);

  console.log('has auth?', hasAuth);

  console.log('process.env', process.env);

  if(!hasAuth) {
    return Cypress.Promise.resolve(false);
  }

  cy.visit('/', {
    auth: {
      username: user,
      password: pass,
    },
  });

})
