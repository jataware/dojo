import get from 'lodash/get';
import p from 'cypress-promise'; // p == promisify
import { genBaseModel } from '../seeds/model_api_data';
// import axios from 'axios';

/**
 *
 **/
function sleep(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



// ========================= Integration Helpers ===============================

export function gen_tranform_intercepts(dataset_id, jobName, result) {
  const method = 'POST';
  return [[
    {
      method: method,
      url: `/api/dojo/job/fetch/*_${jobName}`
    },
    result,
    `${method}_${jobName}_fetch`
  ], [
    {
      method: method,
      url: `/api/dojo/job/*/${jobName}`
    },
    {id: `${dataset_id}_${jobName}`, result},
    `${method}_${jobName}_start`
  ]];
}

// ================== End-to-End Helpers =======================================


const username = Cypress.env('DOJO_DEMO_USER');
const password = Cypress.env('DOJO_DEMO_PASS');
const hasAuth = Boolean(username) && Boolean(password);
const auth = hasAuth ? {username, password} : undefined;



// TODO move/use seed fn
export function createModel(modelId, variant='base', overrides={}) {

  console.log('Creating Seed Model', modelId);

  const testModel = genBaseModel(modelId, variant, overrides);

  modelId = testModel.id;

  cy.request({
    method: 'post',
    url: '/api/dojo/models',
    body: testModel,
    auth
  })
    .its('body').should('include', testModel.id);

  return testModel;
}


export function provisionModelTerminal(modelId) {
  return cy.request({
    method: 'POST',
    failOnStatusCode: false,
    url: `/api/terminal/docker/provision/${modelId}`,
    body: {
      "name": modelId,
      "image": "jataware/dojo-publish:Ubuntu-latest",
      "listeners": []
    },
    auth
  });
}

/**
 *
 **/
export const shutdownWorker = () => {
  return cy.request({
    url: '/api/terminal/docker/locks',
    auth
  })
    .then((lockResponse) => {
      if (get(lockResponse, 'body.locks[0].modelId')) {
        const modelId = lockResponse.body.locks[0].modelId;
        return cy.request({
          method: 'DELETE',
          url: `/api/terminal/docker/${modelId}/release`,
          auth
        });
      }
      return Cypress.Promise.resolve(true);
    });
};

export async function waitForAllUrlsToFinish(urls) {
  const METHOD = 0, URL = 1, BODY = 2;

  const finishedRequests = urls.map(async (item) => {
    const res = await p(cy.request({
      method: item[METHOD],
      url: item[URL],
      body: item[BODY],
      auth
    }));
    return res;
  });

  return finishedRequests;
}

// NOTE use cy.wrap on tests
// TODO try axios
export async function waitUrlToProcess(url, property, maxTries = 6, method='GET') {

  let response = await p(cy.request({
    method,
    url,
    failOnStatusCode: false,
    auth
  }));

  let tries = 0;

  while (!get(response, property) && tries < 5) {
    tries++;
    console.log('url', url, property, 'did not finish', 'tries:', tries, '. Retrying.');
    cy.wait(1000);

    let response = await p(cy.request({
      method,
      url,
      failOnStatusCode: false,
      auth
    }));

  }

  return response;
}



/**
 * NOTE Returns a regular promise, not a "cypress one".
        Use cy.wrap(this_result) to convert to cypress promise on test.
 * TODO rename provisionAndWaitReady => provisionTerminalWaitReady or so
 **/
export async function provisionAndWaitReady(existingModelId) {
  const modelId = existingModelId;

  cy.log(`Provisioning Terminal for model ${modelId}.`);

  // TODO try axios
  const response = await p(cy.request({
    url: '/api/terminal/docker/locks',
    auth
 }));

  let cy_promise;
  if (get(response, 'body.locks[0].modelId')) {
    if (get(response, 'body.locks[0].modelId') !== modelId) {
      cy_promise = shutdownWorker()
        .then(() => {
          return provisionModelTerminal(modelId);
        });
    }
    cy_promise = Promise.resolve(true);
  } else {
    cy_promise = provisionModelTerminal(modelId);
  }

  const provisioned = await p(cy_promise);

  let provisionState = await p(cy.request({
    url: `/api/terminal/provision/state/${modelId}`,
    auth
  }));

  while (provisionState.body.state === 'processing') {
    console.log('Waiting before retrying');
    cy.wait(1000);
    provisionState = await p(cy.request({
      url: `/api/terminal/provision/state/${modelId}`,
      auth
    }));
  }

  return provisionState;
}


/**
 *
 **/
export const getModelRegisterUrls = (modelId, {homeDir, user, fileName, folderName, saveUrl}) => ([

      ['POST',
       '/api/dojo/terminal/file',
       {
         "model_id": modelId,
         "file_path": `${homeDir}/${folderName}/${fileName}`,
         "request_path": `/container/${modelId}/ops/cat?path=%2Fhome%2Fclouseau%2F${folderName}%2F${fileName}`
       }],

      ['POST',
       `/api/dojo/job/${modelId}/tasks.model_output_analysis`,
       {
         "model_id": modelId,
         "fileurl": `/container/${modelId}/ops/cat?path=%2Fhome%2Fclouseau%2F${folderName}%2F${fileName}`,
         "filepath": `/home/clouseau/${folderName}/${fileName}`,
         "synchronous": true,
         "context": {}
       }],
      ['POST',
       `/api/dojo/job/${modelId}/file_processors.model_output_preview`,
       {
         "context": {
           "uuid": modelId,
           "dataset": {
             "id": modelId,
             "name": "TestSeedModel",
             "family_name": null,
             "description": "fefe",
             "deprecated": false,
             "published": false,
             "domains": [
               "Physics"
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
             "filepath": `/home/clouseau/${folderName}/${fileName}`,
             "x-resolution": "",
             "y-resolution": ""
           },
           "annotations": {
             "annotations": {},
             "metadata": {
               "filename": `/home/clouseau/${folderName}/${fileName}`,
               "file_uuid": "f6d85da0-f768-4c4b-823b-cca6b0680df2",
               "fileurl": `/container/${modelId}/ops/cat?path=%2Fhome%2Fclouseau%2F${folderName}%2F${fileName}`,
               "filepath": `/home/clouseau/${folderName}/${fileName}`
             }
           }
         },
         "filename": null,
         "force_restart": true
       }],

      ['POST',
       `/api/dojo/job/${modelId}/elwood_processors.run_model_elwood`,
       {
         "context": {
           "uuid": modelId,
           "dataset": {
             "id": modelId,
             "name": "Test-Output-Name",
             "family_name": null,
             "description": "fefe",
             "deprecated": false,
             "published": false,
             "domains": [
               "Physics"
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
             "filepath": `/home/clouseau/${folderName}/${fileName}`,
             "x-resolution": "",
             "y-resolution": ""
           },
           "annotations": {
             "annotations": {
               "feature": [
                 {
                   "aliases": {},
                   "type": "feature",
                   "description": "val-desc",
                   "display_name": "value",
                   "qualifies": [],
                   "qualifierrole": "breakdown",
                   "feature_type": "float",
                   "units_description": "",
                   "units": "val",
                   "name": "value"
                 }
               ],
               "geo": [
                 {
                   "aliases": {},
                   "type": "geo",
                   "description": "desc-latlon",
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
                   "description": "desc-latlon",
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
                   "description": "date-desc",
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
               "filename": `/home/clouseau/${folderName}/${fileName}`,
               "file_uuid": "f6d85da0-f768-4c4b-823b-cca6b0680df2",
               "fileurl": `/container/${modelId}/ops/cat?path=%2Fhome%2F${user}%2F${folderName}%2F${fileName}`,
               "filepath": `${homeDir}/${folderName}/${fileName}`,
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
         "filename": `model-output-samples/${modelId}/f6d85da0-f768-4c4b-823b-cca6b0680df2.csv`,
         "force_restart": true
       }],

      ['POST',
       '/api/dojo/dojo/outputfile',
       [
         {
           "id": "f6d85da0-f768-4c4b-823b-cca6b0680df2",
           "model_id": modelId,
           "name": "Test-Output-Name",
           "output_directory": `${homeDir}/${folderName}`, // TODO need to nest within an additional output DIR
           "path": fileName.replace('data', 'data*'),
           "file_type": "csv",
           "transform": {
             "feature": [
               {
                 "aliases": {},
                 "type": "feature",
                 "description": "val-desc",
                 "display_name": "value-displayed",
                 "qualifies": [],
                 "qualifierrole": "breakdown",
                 "feature_type": "float",
                 "units_description": "",
                 "units": "val",
                 "name": "value"
               }
             ],
             "geo": [
               {
                 "aliases": {},
                 "type": "geo",
                 "description": "desc-latlon",
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
                 "description": "desc-latlon",
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
                 "description": "date-desc",
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
       ]],

      ['POST',
       '/api/dojo/dojo/config',
       [
         {
           "model_config": {
             "model_id": modelId,
             "parameters": [
               {
                 "start": 11,
                 "end": 14,
                 "text": "2.3",
                 "annotation": {
                   "name": "rain",
                   "description": "rainf",
                   "type": "float",
                   "default_value": "2.3",
                   "unit": "",
                   "unit_description": "",
                   "data_type": "numerical",
                   "predefined": false,
                   "options": [],
                   "min": "",
                   "max": ""
                 }
               }
             ],
             "path": `${homeDir}/${folderName}/parameters.json`,
             "md5_hash": "958d3f92c05b1489d368d7ee74fe8bdd"
           },
           "file_content": "{rainfall: 2.3}"
         }
       ]],

      ['POST',
       "/api/dojo/dojo/accessories",
       {
         "model_id": modelId,
         "path": `${homeDir}/${folderName}/accessory.png`,
         "caption": "tag"
       }],

      ['POST',
       '/api/dojo/dojo/directive',
       {
         "model_id": modelId,
         "parameters": [
           {
             "start": 14,
             "end": 25,
             "text": "output_data",
             "annotation":
             {
               "name": "temp",
               "description": "mocking",
               "type": "float",
               "default_value": "1.2",
               "unit": "",
               "unit_description": "",
               "data_type": "numerical",
               "predefined": false,
               "options": [],
               "min": "",
               "max": ""
             }
           }
         ],
         "command": `cat ${folderName}/${fileName}`,
         "cwd": homeDir
       }]
]);

export async function waitForElwood(taskName, datasetId) {
  const formattedUrl = `/api/dojo/job/fetch/${datasetId}_elwood_processors.${taskName}`;

  const reqArgs = {
    method: 'POST',
    url: formattedUrl,
    failOnStatusCode: false,
    auth
  }

  let elwoodStatus = await p(cy.request(reqArgs));

  while (elwoodStatus.status === 200) {
    cy.wait(3000);
    elwoodStatus = await p(cy.request(reqArgs));
  }

  return elwoodStatus;
}


// Use this exported object once cleaned up?
export const getTestModelRegisterUrls = (modelId, {homeDir, user, fileName, folderName, saveUrl, directiveParamValue}) => ([

  ['POST',
   `/api/dojo/job/${modelId}/tasks.model_output_analysis`,
   {
     "model_id": modelId,
     "fileurl": `/container/${modelId}/ops/cat?path=%2Fhome%2Fclouseau%2F${folderName}%2F${fileName}`,
     "filepath": `/home/clouseau/${folderName}/${fileName}`,
     "synchronous": true,
     "context": {}
   }],

  ['POST',  `/api/dojo/job/${modelId}/file_processors.model_output_preview`, {
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
          "fileurl": `/container/${modelId}/ops/cat?path=%2Fhome%2Fclouseau%2F${folderName}%2Foutput%2F${fileName}`,
          "filepath": `${homeDir}/${folderName}/output/${fileName}`
        }
      }
    },
    "filename": null,
    "force_restart": true
  }],

  ['POST',
   `/api/dojo/job/${modelId}/elwood_processors.run_model_elwood`,
   {
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
           "filename": `${homeDir}/{$folderName}/output/output_*.csv`,
           "file_uuid": "bbae0b07-33d1-4e2b-82ea-ef72026cdfc7",
           "fileurl": `/container/${modelId}/ops/cat?path=%2Fhome%2F${user}%2F${folderName}%2Foutput%2F${fileName}`,
           "filepath": `/home/clouseau/test-model/output/output_0.9_${directiveParamValue}.csv`,
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
   }
  ],

  ['POST',
   '/api/dojo/dojo/outputfile',
   [
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
   ]
  ],

  ['POST',
   '/api/dojo/dojo/config',
   [
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
   ]
  ],

  ['POST',
   '/api/dojo/dojo/directive',
   {
     "model_id": modelId,
     "parameters": [
       {
         "start": 23,
         "end": 26,
         "text": `${directiveParamValue}`,
         "annotation": {
           "name": "temp",
           "description": "temp",
           "type": "float",
           "default_value": `${directiveParamValue}`,
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
     "command": `python3 main.py --temp=${directiveParamValue}`,
     "cwd": "/home/clouseau/test-model"
   }
  ]
]);
