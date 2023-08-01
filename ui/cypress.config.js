const { defineConfig } = require("cypress");

module.exports = defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,

  "experimentalStudio" : true,

  e2e: {
    viewportHeight: 1000,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:8080",
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    "experimentalRunAllSpecs": true,
    "experimentalMemoryManagement": true
  }
});
