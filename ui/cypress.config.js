const { defineConfig } = require("cypress");
const webpackConfig = require('./cypress/webpack.cypress.js');

const user = process.env['cypress_dojo_demo_user']
const pass = process.env['cypress_dojo_demo_pass'];

// console.log(user);

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
    // baseUrl: `https://${user}:${pass}@dojo.jata.lol`,
    baseUrl: 'https://dojo.jata.lol',
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
