import identity from 'lodash/identity';
import FullScreenTemplater from '../../client/components/templater/FullScreenTemplater';

import {
  genBaseModel, genConfig,
  // genDirective, generatedIDs
} from '../seeds/model_api_data';


const mockData = {
  "editor_content": "python main.py temp=10.4",
  // "content_id": "/home/clouseau/test-model/configFiles/parameters.json",
  "parameters": [
    {
      "start": 20,
      "end": 24,
      "text": "10.4",
      "annotation": {
        "name": "",
        "description": "",
        "type": "float",
        "default_value": "10",
        "unit": "UNIT",
        "unit_description": "UNIT temp",
        "data_type": "numerical",
        "options": [
        ],
        "min": "",
        "max": ""
      }
    }
  ],
  // "md5_hash": "61da491d3e89d79c5f3fe0e438ecd4b9"
};

describe('FullScreenTemplater: directive', { browser: ['chrome', 'chromium', 'firefox'] }, () => {

  const testModel = genBaseModel();

  console.log('testmodel id:', testModel.id);

  beforeEach(() => {

    cy.request('post', '/api/dojo/models', testModel)
      .its('body').should('include', testModel.id);

    const config = genConfig(testModel.id);
    cy.request('post', '/api/dojo/dojo/config', config)
      .its('body').should('include', testModel.id);
  });

  it('With templater open, annotating a config stores to system correctly', () => {

    cy.mount(
      <FullScreenTemplater
        content={{
          parameters: mockData.parameters,
          editor_content: mockData.editor_content,
          cwd: '/home/closeau/test-model',
        }}
        contentChanged={false}
        open
        mode="directive"
        modelId={testModel.id}
        setOpen={identity}
      />
    );

    cy.findByTestId('annotation-inner-contents')
      .trigger('mouseover');

    cy.findByTestId('annotate-tooltip-edit')
      .click();

    cy.findAllByRole('textbox') // {name: /name/i}
      .eq(0)
      .type('temperature');

    cy.findAllByRole('textbox') // {name: /description/i}
      .eq(1)
      .type('temp-description');

    cy.intercept('POST', `/api/dojo/dojo/directive/`).as('CreatingDirective');

    cy.findByRole('button', {name: /Submit/i})
      .click();

    cy.findByRole('button', {name: /save/i})
      .click();

    cy.wait(1000);
    // cy.wait('@CreatingDirective');

    cy.request(`/api/dojo/dojo/directive/${testModel.id}`)
      .its('body').should((response) => {

        console.log('response', response);

        expect(response.parameters[0].text).to.equal('10.4');
        expect(response.parameters[0].annotation.description).to.equal('temp-description');
      });
  });

});
