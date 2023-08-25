const { defineConfig } = require("cypress");
const webpackConfig = require('./cypress/webpack.cypress.js');

const BASE_URL = process.env.CYPRESS_BASE_URL || "http://localhost:8080";

module.exports = defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,

  experimentalStudio : true,

  e2e: {
    viewportHeight: 1000,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: BASE_URL,

    specPattern: 'cypress/e2e/**/*.cy.js',
    "experimentalRunAllSpecs": true,
    "experimentalMemoryManagement": true
  },

  component: {

    viewportHeight: 1000,
    viewportWidth: 1200,

    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig,
    },
  },
});
