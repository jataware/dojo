/// <reference types="cypress" />
// ***********************************************************
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const axios = require('axios');
const fs = require('fs');
const path = require('path');
var FormData = require('form-data');

const { Client } = require('@elastic/elasticsearch');


const esHost = process.env.CYPRESS_ES_HOST || 'http://localhost:9200';

// TODO decide what to do for staging/remote:
const es = new Client({ node: esHost });

const chalk = require('chalk');

const warn = chalk.hex('#FFA500');
const debugColor= chalk.bold.blue;

const debug = (...args) => {
  console.log(
    warn(`***[DEBUG]***:`),
    debugColor(...args)
  );
}

const cy_env = JSON.stringify(process.env, null, 2)
      .split('\n')
      .filter(i => i.includes('CYPRESS'))
      .join('\n');

// TODO remove when testing on github actions on stage instance
debug('env', '\n', cy_env);


const esIndexMappings = {
  dataset: 'indicators',
  model: 'models',
  annotation: 'annotations',
  directive: 'directives',
  outputfile: 'outputfiles',
  accessory: 'accessories',
  config: 'configs'
};


/**
 * Deletes related entities to model in order to clean up seeds after real tests.
 **/
function deleteByModelQuery(modelId, type) {

  if (!modelId) {
    throw new Error('Can\'t call plugins/index:deleteByModelQuery() without a modelId');
  }

  const index = esIndexMappings[type];

  debug(`Called deleteByModelQuery with modelid=${modelId} and type=${type}`);

  const promise = es.deleteByQuery({
    index,
    max_docs: 4,
    body: {
      "query": {
        "term": {
          "model_id": modelId
        }
      }
    }
  });
  return promise;
}

/**
 *
 **/
function deleteById({type, id, name}) {
  const index = esIndexMappings[type];

  const promise = es.delete({
    index,
    id: id
  });
  return promise;
}


function deleteByName({type, name}) {

  const index = esIndexMappings(type);

  const promise = es.deleteByQuery({
    index,
    body: {
      query: {
        match: { 'name.keyword': name }
      }
    }
  });
}

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {

  if (config.testingType === 'component') {
    const { startDevServer } = require('@cypress/webpack-dev-server');
    const webpackConfig = require('../webpack.cypress.js');

    on('dev-server:start', (options) =>
      startDevServer({ options, webpackConfig })
    );
  }

  on('task', {

    'debug': (...args) => {debug(...args); return true;},

    // NOTE This runs on Cypress nodejs backend. Alternatively, we can create
    // DELETE DOJO API endpoints for these entities.
    // Defined as cy.task since we don't have access to DB/elasticsearch
    // from the browser.
    'seed:clean': ({type, id, name}) => {

      debug(`Cleaning ${type} seeds, id: ${id}, name: ${name}`);

      if (!type) {
        debug('Should have passed in a valid type. Throwing the towel.');
        throw new Error(`No valid type passed in to seed:clean. Received: ${type}`);
      }

      if (type === 'model') {
        // Need to delete multiple items before cleaning
        debug('Clearing related model seeds.');
        deleteByModelQuery(id, 'accessory');
        deleteByModelQuery(id, 'directive');
        deleteByModelQuery(id, 'outputfile');
        deleteByModelQuery(id, 'config');
      }

      if (id) {
        return deleteById({type,id});
      } else if (name) {
        return deleteByName({type,name});
      } else {
        throw new Error(`No valid id or name passed in to seed:clean. Received: type=${type}, id=${id}, name=${name}`);
      }

    }

  });

  return config;
};


// if (require.main === module) {
// NOTE uncomment and run this clause as node script to develop/debug.
// }
