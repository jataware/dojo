import 'cypress-iframe';
import { genBaseModel, generatedIDs } from '../seeds/model_api_data';

const date = Date.now().toString();
const directiveCmd = `run file.txt --data=${date}`;
const modelName = `TestModel_created_at=${date}`;

import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import last from 'lodash/last';

import { createModel, provisionModelTerminal, shutdownWorker,
         provisionAndWaitReady,
         // getModelRegisterUrls,
         // getTestModelRegisterUrls,
         waitUrlToProcess } from '../support/helpers';

import p from 'cypress-promise'; // p == promisify

/**
 *
 **/
function cleanModel(modelId) {

  cy.visit('/admin');

  return shutdownWorker().then(() => {
    console.log('Done clearing worker, clearing seeds.');
    cy.task('seed:clean', {type: 'model', id: modelId});
  });
}

async function waitForAllUrlsToFinish(urls) {
  const METHOD = 0, URL = 1, BODY = 2;

  const finishedRequests = urls.map(async (item) => {
    const res = await p(cy.request(item[METHOD], item[URL], item[BODY]));
    return res;
  });

  console.log('finishedRequests', finishedRequests);

  return finishedRequests;
}

describe.only('Register/Publish Test Model', () => {

  let modelId = undefined;

  // TODO enable
  // afterEach(() => {
  //   cleanModel(modelId);
  // });

  it('E2E Test Model Register/publish completed.', () => {

    // http://localhost:8080/api/terminal/docker/locks
    // modelId = 'acab2a55-8356-4029-99c2-734b4939293e';

    const testModel = createModel(modelId);

    modelId = testModel.id;


    console.log('Test Model ID:', modelId);

    cy.wrap(provisionAndWaitReady(modelId))
      .then(() => {

        cy.wait(500);

        const fileName = 'output_0.9_4.8.csv';
        const folderName = 'test-model';
        const user = 'clouseau';
        const homeDir = `/home/${user}`;

        const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

        cy.visit(`/term/${testModel.id}`);

        cy.reload();

        cy.findByRole('textbox', {name: /terminal input/i}).as('TerminalInput');

        cy.get('@TerminalInput')
          .type(`sudo apt update && sudo apt install -y python3-pip && git clone https://github.com/jataware/test-model.git && cd test-model{enter}`);

        cy.wait(50000);

        // cy.findByText(/Resolving deltas: 100%/i, {timeout: 85000});

        cy.get('@TerminalInput')
          .type(`git checkout 041cdfa10a995a2d55baeb3ebe35320f22bc996a && pip3 install -r requirements.txt{enter}`);

        cy.wait(30000);

        // cy.findByText(/Successfully installed/i);

        cy.get('@TerminalInput')
          .type('python3 main.py --temp=4.8{enter}');

        cy.wait(4000);

        cy.get('@TerminalInput')
          .type('dojo tag media/1WWMDwIQ_400x400.jpg "1"{enter}');

        cy.wait(3000);

        cy.request('POST', '/api/dojo/dojo/directive', {
          "model_id": modelId,
          "parameters": [
            {
              "start": 23,
              "end": 26,
              "text": "4.8",
              "annotation": {
                "name": "temp",
                "description": "temp",
                "type": "float",
                "default_value": "4.8",
                "unit": "temp",
                "unit_description": "temp",
                "data_type": "numerical",
                "predefined": false,
                "options": [],
                "min": "",
                "max": ""
              }
            }
          ],
          "command": "python3 main.py --temp=4.8",
          "cwd": "/home/clouseau/test-model"
        })
          .then(() => {

            cy.request('POST', '/api/dojo/dojo/config', [
              {
                "model_config": {
                  "model_id": modelId,
                  "parameters": [
                    {
                      "start": 13,
                      "end": 16,
                      "text": "0.9",
                      "annotation": {
                        "name": "rain",
                        "description": "rain",
                        "type": "float",
                        "default_value": "0.9",
                        "unit": "rain",
                        "unit_description": "rain",
                        "data_type": "numerical",
                        "predefined": false,
                        "options": [],
                        "min": "",
                        "max": ""
                      }
                    }
                  ],
                  "path": "/home/clouseau/test-model/configFiles/parameters.json",
                  "md5_hash": "c982ef4fdc0ebb2fb43a9b86d23d0b7d"
                },
                "file_content": "{\"rainfall\": 0.9}\n"
              }
            ]).then(() => {

              cy.wait(500);

              const urls = [['POST',  `/api/dojo/job/${modelId}/file_processors.model_output_preview`, {
                "context": {
                  "uuid": modelId,
                  "dataset": {
                    "id": modelId,
                    "name": "TempRainTest",
                    "family_name": null,
                    "description": "test model rainf",
                    "deprecated": false,
                    "published": false,
                    "domains": [
                      "Mathematics"
                    ],
                    "maintainer": {
                      "email": "",
                      "name": "",
                      "website": "",
                      "organization": ""
                    },
                    "data_sensitivity": null,
                    "data_quality": null,
                    "data_paths": [],
                    "outputs": [],
                    "qualifier_outputs": [],
                    "tags": [],
                    "fileData": {
                      "raw": {
                        "uploaded": false,
                        "url": null
                      }
                    },
                    "temporal_resolution": "annual",
                    "filepath": "/home/clouseau/test-model/output/output_*.csv",
                    "x-resolution": "",
                    "y-resolution": ""
                  },
                  "annotations": {
                    "annotations": {},
                    "metadata": {
                      "filename": "/home/clouseau/test-model/output/output_*.csv",
                      "file_uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                      "fileurl": `/container/${modelId}/ops/cat?path=%2Fhome%2Fclouseau%2Ftest-model%2Foutput%2Foutput_0.9_4.8.csv`,
                      "filepath": "/home/clouseau/test-model/output/output_0.9_4.8.csv"
                    }
                  }
                },
                "filename": null,
                "force_restart": true
              }]];


              cy.wrap(waitForAllUrlsToFinish(urls)).then(() => {

                cy.wait(500);

                cy.request('POST', `/api/dojo/job/${modelId}/elwood_processors.run_model_elwood`, {
                  "context": {
                    "uuid": modelId,
                    "dataset": {
                      "id": modelId,
                      "name": "TempRainTest",
                      "family_name": null,
                      "description": "test model rainf",
                      "deprecated": false,
                      "published": false,
                      "domains": [
                        "Mathematics"
                      ],
                      "maintainer": {
                        "email": "",
                        "name": "",
                        "website": "",
                        "organization": ""
                      },
                      "data_sensitivity": null,
                      "data_quality": null,
                      "data_paths": [],
                      "outputs": [],
                      "qualifier_outputs": [],
                      "tags": [],
                      "fileData": {
                        "raw": {
                          "uploaded": false,
                          "url": null
                        }
                      },
                      "temporal_resolution": "annual",
                      "filepath": "/home/clouseau/test-model/output/output_*.csv",
                      "x-resolution": "",
                      "y-resolution": ""
                    },
                    "annotations": {
                      "annotations": {
                        "feature": [
                          {
                            "aliases": {},
                            "type": "feature",
                            "description": "featval",
                            "display_name": "value",
                            "qualifies": [],
                            "qualifierrole": "breakdown",
                            "feature_type": "float",
                            "units_description": "",
                            "units": "fv",
                            "name": "value"
                          }
                        ],
                        "geo": [
                          {
                            "aliases": {},
                            "type": "geo",
                            "description": "latlon",
                            "display_name": "latitude",
                            "qualifies": [],
                            "qualifierrole": "breakdown",
                            "geo_type": "longitude",
                            "resolve_to_gadm": false,
                            "coord_format": "lonlat",
                            "name": "longitude",
                            "primary_geo": true,
                            "gadm_level": "country"
                          },
                          {
                            "aliases": {},
                            "type": "geo",
                            "description": "latlon",
                            "display_name": "latitude",
                            "qualifies": [],
                            "qualifierrole": "breakdown",
                            "geo_type": "latitude",
                            "resolve_to_gadm": false,
                            "coord_format": "lonlat",
                            "name": "latitude",
                            "primary_geo": true,
                            "gadm_level": "country",
                            "is_geo_pair": "longitude"
                          }
                        ],
                        "date": [
                          {
                            "aliases": {},
                            "type": "date",
                            "description": "date",
                            "display_name": "date",
                            "qualifies": [],
                            "qualifierrole": "breakdown",
                            "date_type": "date",
                            "time_format": "%Y-%m-%d",
                            "name": "date",
                            "primary_date": true
                          }
                        ]
                      },
                      "metadata": {
                        "filename": "/home/clouseau/test-model/output/output_*.csv",
                        "file_uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                        "fileurl": `/container/${modelId}/ops/cat?path=%2Fhome%2Fclouseau%2Ftest-model%2Foutput%2Foutput_0.9_4.8.csv`,
                        "filepath": "/home/clouseau/test-model/output/output_0.9_4.8.csv",
                        "geotime_classify": {
                          "date": {
                            "category": "time",
                            "subcategory": "date",
                            "format": "%Y-%m-%d"
                          },
                          "latitude": {
                            "category": "geo",
                            "subcategory": "latitude",
                            "format": null
                          },
                          "longitude": {
                            "category": "geo",
                            "subcategory": "longitude",
                            "format": null
                          }
                        }
                      }
                    }
                  },
                  "filename": `model-output-samples/${modelId}/bbae0b07-33d1-4e2b-82ea-ef72026cdfc7.csv`,
                  "force_restart": true
                }).then(() => {

                  cy.wait(500);

                  cy.request('POST', '/api/dojo/dojo/outputfile', [
                    {
                      "id": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                      "model_id": modelId,
                      "name": "TempRainTest",
                      "output_directory": "/home/clouseau/test-model/output",
                      "path": "output_*.csv",
                      "file_type": "csv",
                      "transform": {
                        "feature": [
                          {
                            "aliases": {},
                            "type": "feature",
                            "description": "featval",
                            "display_name": "value",
                            "qualifies": [],
                            "qualifierrole": "breakdown",
                            "feature_type": "float",
                            "units_description": "",
                            "units": "fv",
                            "name": "value"
                          }
                        ],
                        "geo": [
                          {
                            "aliases": {},
                            "type": "geo",
                            "description": "latlon",
                            "display_name": "latitude",
                            "qualifies": [],
                            "qualifierrole": "breakdown",
                            "geo_type": "longitude",
                            "resolve_to_gadm": false,
                            "coord_format": "lonlat",
                            "name": "longitude",
                            "primary_geo": true,
                            "gadm_level": "country"
                          },
                          {
                            "aliases": {},
                            "type": "geo",
                            "description": "latlon",
                            "display_name": "latitude",
                            "qualifies": [],
                            "qualifierrole": "breakdown",
                            "geo_type": "latitude",
                            "resolve_to_gadm": false,
                            "coord_format": "lonlat",
                            "name": "latitude",
                            "primary_geo": true,
                            "gadm_level": "country",
                            "is_geo_pair": "longitude"
                          }
                        ],
                        "date": [
                          {
                            "aliases": {},
                            "type": "date",
                            "description": "date",
                            "display_name": "date",
                            "qualifies": [],
                            "qualifierrole": "breakdown",
                            "date_type": "date",
                            "time_format": "%Y-%m-%d",
                            "name": "date",
                            "primary_date": true
                          }
                        ],
                        "meta": {
                          "ftype": "csv"
                        }
                      },
                      "prev_id": null
                    }
                  ]).then(() => {

                    cy.wait(500);

                    cy.request('PATCH', `/api/dojo/models/${modelId}`, {
                      "outputs": [
                        {
                          "uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                          "name": "value",
                          "display_name": "value",
                          "description": "featval",
                          "type": "float",
                          "unit": "fv",
                          "unit_description": "",
                          "is_primary": false,
                          "data_resolution": {
                            "temporal_resolution": "annual"
                          },
                          "alias": {},
                          "choices": null,
                          "min": null,
                          "max": null,
                          "ontologies": null
                        }
                      ],
                      "qualifier_outputs": [
                        {
                          "uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                          "name": "date",
                          "display_name": "date",
                          "description": "date",
                          "type": "datetime",
                          "unit": null,
                          "unit_description": null,
                          "related_features": [],
                          "qualifier_role": "breakdown",
                          "alias": {}
                        },
                        {
                          "uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                          "name": "longitude",
                          "display_name": "latitude",
                          "description": "latlon",
                          "type": "lng",
                          "unit": null,
                          "unit_description": null,
                          "related_features": [],
                          "qualifier_role": "breakdown",
                          "alias": {}
                        },
                        {
                          "uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
                          "name": "latitude",
                          "display_name": "latitude",
                          "description": "latlon",
                          "type": "lat",
                          "unit": null,
                          "unit_description": null,
                          "related_features": [],
                          "qualifier_role": "breakdown",
                          "alias": {}
                        }
                      ]
                    }).then(() => {

                      cy.wait(500);

                      cy.wrap(waitUrlToProcess(`/api/dojo/dojo/config/${modelId}`, '[0]'))
                        .then(() => {

                          cy.wait(500);

                          cy.findByRole('button', {name: /save and continue/i})
                            .click();

                          cy.findByText(/Uploading Model to Docker.+/i);

                          // cy.reload();
                          cy.wait(10000);

                          cy.findByText(/Upload Complete.+/i, {timeout: 20000});

                          // TODO button doesn't show up: Help.
                          // cy.findByRole('button', {name: /Publish/i})
                          //   .click();

                          // cy.wait(500);

                          // // TODO intercept
                          // cy.intercept('POST', `/api/dojo/models/register/${modelId}`).as('RegisterModelComplete');

                          // cy.findByRole('button', {name: /Yes/i})
                          //   .click();

                          // cy.wait('RegisterModelComplete');


                          // cy.findByText(/Uploaded to Causemos/i);

                          // TODO check final model with register property, etc
                          // cy.request('')
                        });

                    });
                  });

                });

              });

            });

          });

      });

  });

});
