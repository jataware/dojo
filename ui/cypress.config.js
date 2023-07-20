const { defineConfig } = require("cypress");

module.exports = defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:8080",
  },

  component: {
    setupNodeEvents(on, config) {},
    viewportHeight: 1200,
    viewportWidth: 1000,
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
});
