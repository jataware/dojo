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
const es = new Client({ node: 'http://localhost:9200' });

const { genBaseModel } = require('../seeds/model_api_data');


async function sendFileToEndpoint(filename, endpointUrl, newFilename) {
  // Read the file as a stream
  const fileStream = fs.createReadStream(filename);

  // Create a FormData object to send the file as multipart/form-data
  const formData = new FormData();
  formData.append('file', fileStream);

  formData.append('file', fileStream);
  if (newFilename) {
    formData.append('filename', newFilename);
  }

  // Make a POST request using axios

  console.log('endpointUrl', endpointUrl);
  console.log('filename', filename);

  const response = await axios.post(endpointUrl, formData, {
    headers: {
      ...formData.getHeaders(), // Set the appropriate headers for multipart/form-data
    },
  });

  console.log('========== Response from server:', response.data);

  return response;

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

    // TODO this is unused for now as we can use API
    // for simple cases, but for complex scenarios it will be useful
    'seed': ({type, id, name}) => {

      console.log('Seed task running');

      // create a model, return a promise for the caller to wait on
      let promise;

      switch (type) {
        case 'model':
          console.log('seeding registered model');
        promise = axios.post('http://localhost:8000/dojo/models/', genBaseModel());
          break;
        default:
          console.log('TODO Warning: Default clause on seed:api.');
          // promise = axios.post('api/dojo/models/', genBaseModel());
      }

      return promise;
    },

    // TODO clean up (better switch/case); support datasets, etc
    'seed:clean': ({type, id, name}) => {
      console.log(`cleaning ${type} seeds, id: ${id}, name: ${name}`);

      if (type == 'model' && id) {
        const promise = es.delete({
          index: "models",
          // type: "products",
          id: id
        });
        return promise;

      } else if (type == 'model' && name) {
        // Actually deletes app TestModel_created_at= models
        const promise = es.deleteByQuery({
          index: 'models',
          body: {
            query: {
              match: { 'name.keyword': name }
            }
          }
        });

        return promise;

      } else {
        throw new Error('Invalid type and param combination');
      }

    },

    'upload': async ({type, id, variant}) => {
      // assume type=dataset for now
      // assume variant=acled for now

      const url = `http://localhost:8080/api/dojo/indicators/${id}/upload`;
      const mockFileLocation = path.join(__dirname, '..', 'files', 'ACLED_redacted.xlsx');

      // returns promise. TODO check what failure conditions look like on cypress
      await sendFileToEndpoint(mockFileLocation, url);

      const mockCSVFileLocation = path.join(__dirname, '..', 'files', 'raw_data.csv');

      // returns promise. TODO check what failure conditions look like on cypress
      await sendFileToEndpoint(mockCSVFileLocation, url, 'raw_data.csv');

      return true;
    }


  });

  return config;
};

// if (require.main === module) {

//   console.log('called directly');

//   const id = '2c5422eb-53a2-40b5-8c03-983f757d5efb';
//   const url = `http://localhost:8080/api/dojo/indicators/${id}/upload`;
//   const mockFileLocation = path.join(__dirname, '..', 'files', 'ACLED_redacted.xlsx');


//   console.log('mockFileLocation', mockFileLocation);

//   // returns promise. TODO check what failure conditions look like on cypress
//   return sendFileToEndpoint(mockFileLocation+'', url);

// } else {
//   console.log('required as a module');
// }
