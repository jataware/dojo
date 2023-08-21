/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
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


const esHost = process.env.CYPRESS_ES_HOST;

// TODO decide what to do for staging/remote:
const es = new Client({ node: esHost || 'http://localhost:9200' });

const baseUrl = process.env.CYPRESS_BASE_URL;

const { genBaseModel } = require('../seeds/model_api_data');


const chalk = require('chalk');

const warn = chalk.hex('#FFA500');
const debugColor= chalk.bold.blue;

const debug = (...args) => {
  console.log(
    warn(`***[DEBUG]***:`),
    debugColor(...args)
  );
}

const username = process.env['DOJO_DEMO_USER'];
const password = process.env['DOJO_DEMO_PASS'];

const cy_env = JSON.stringify(process.env, null, 2)
      .split('\n')
      .filter(i => i.includes('CYPRESS'))
      .join('\n');

debug('env', '\n', cy_env);

/**
 *
 **/
async function sendFileToEndpoint(filePath, endpointUrl, newFilename) {
  const auth = username ? {auth: username, password} : null;

  const fileStream = fs.createReadStream(filePath);

  const formData = new FormData();
  formData.append('file', fileStream);

  if (newFilename) {
    formData.append('filename', newFilename);
  }

  debug('~ username:', username);

  const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

  const config = {
    method: 'POST',
    url: endpointUrl,
    data: formData,
    headers: {
      ...formData.getHeaders(), // Set the appropriate headers for multipart/form-data
      Authorization: authHeader,
    },
  };

  // Make a POST request using axios
  debug('endpointUrl', endpointUrl);
  debug('filename', filePath);
  debug('axios config');
  debug(JSON.stringify(config));

  try {
    const response = await axios(config);

    debug(`Response: ${Object.keys(response)}`);

    if (response) {
      return response.data;
    }
  } catch(e) {
    debug('Error while uploading file:\n');
    debug(e);
  }

  return null;
}


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

// Cypress is not defined, won't work:
// console.log('Cypress', Cypress);
// debug('Cypress', Cypress);


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

    // TODO this is unused for now as we can use API
    // for simple cases, but for complex scenarios it will be useful
    'seed': ({type, id, name}) => {
      // TODO
      debug("Not implemented. Called cypress task seed. Nothing done on plugins nodejs side for now. Use cy.request with the Dojo API.");
      return undefined;
    },

    'seed:clean': ({type, id, name}) => {

      debug(`Cleaning ${type} seeds, id: ${id}, name: ${name}`);

      if(!type) {
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

    },

    'upload': ({type, id, variant='acled'}) => {

      if (type === 'dataset') {
        const url = `${baseUrl}/api/dojo/indicators/${id}/upload`;

        if (variant === 'acled') {
          const mockCSVFileLocation = path.join(__dirname, '..', 'files', 'raw_data.csv');
          return sendFileToEndpoint(mockCSVFileLocation, url, 'raw_data.csv');
        } else if (variant === 'uniform') {
          const mockCSVFileLocation = path.join(__dirname, '..', 'files', 'gridded_uniform_raw_data.csv');
          return sendFileToEndpoint(mockCSVFileLocation, url, 'raw_data.csv');
        }
      }

      return undefined; // Test will error if not for datasets for now
    }

  });

  return config;
};


// if (require.main === module) {
// NOTE uncomment and run this clause as node script to develop/debug.
// }
