


### Setup

Files that contain e2e (.e2e.cy.js) extension work end-to-end with running backend services,
while regular .cy.js are UI integration tests and have mocked backend.


### Seeding

TODO
Runs on browser context, we have Dojo API endpoints for them
```
cy.seed({type: 'model', data: {}});
```

### Cleaning seeds

Occurs on nodeJs cypress DB side, since we don't have access to es/DB from cypress browser context.
```
cy.task('seed:clean', {type: 'model', id: ''});
```


### Some Helpers/Notes

Depends on host:
cy.onlyOn('localhost')

onlyOn('mac', () => {
  onlyOn('chrome', () => {
    it('works', () => {})
  })
})


```js
if (window.Cypress) {
  // we are running in Cypress
  // so do something different here
  window.env = 'test'
} else {
  // we are running in a regular ol' browser
}
```


```js
if (Cypress.config('isInteractive')) {
  // interactive "cypress open" mode!
} else {
  // "cypress run" mode
}
```
