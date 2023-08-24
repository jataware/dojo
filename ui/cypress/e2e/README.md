
Depends on host:
cy.onlyOn('localhost')

onlyOn('mac', () => {
  onlyOn('chrome', () => {
    it('works', () => {})
  })
})

excludeSpecPattern: *.hot-update.js*.hot-update.js
*.e2e.js

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
