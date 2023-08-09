import { genBaseModel } from '../seeds/model_api_data';

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

export function createModel(modelId) {

  console.log('Creating Seed Model', modelId);

  const testModel = genBaseModel(modelId);

  modelId = testModel.id;

  // The next two requests make the tests slower when iterating/developing tests:
  cy.request('post', '/api/dojo/models', testModel)
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
    }
  });
}
