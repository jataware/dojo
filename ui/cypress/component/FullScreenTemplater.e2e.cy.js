import identity from 'lodash/identity';
import FullScreenTemplater from '../../client/components/templater/FullScreenTemplater';

import {
  genBaseModel, // genConfig,
  genDirective, generatedIDs
} from '../seeds/model_api_data';


const mockData = {
  "editor_content": "this is the file \nit has a second line",
  "content_id": "/home/clouseau/test-model/configFiles/parameters.json",
  "parameters": [
    {
      "start": 27,
      "end": 33,
      "text": "second",
      "annotation": {
        "name": "NAME FIELD",
        "description": "DESCRIPTION FIELD",
        "type": "str",
        "default_value": "second",
        "unit": "UNIT",
        "unit_description": "UNIT  DESCRIPTION",
        "data_type": "freeform",
        "predefined": true,
        "options": [
          "option 1",
          "option 2"
        ],
        "min": "",
        "max": ""
      }
    },
    {
      "start": 5,
      "end": 16,
      "text": "is the file",
      "annotation": {
        "name": "Another parameter name",
        "description": "Another description",
        "type": "int",
        "default_value": "is the file",
        "unit": "testing",
        "unit_description": "a test",
        "data_type": "numerical",
        "predefined": false,
        "options": [],
        "min": "1",
        "max": "5"
      }
    }
  ],
  "md5_hash": "61da491d3e89d79c5f3fe0e438ecd4b9"
};



describe('FullScreenTemplater: config', { browser: ['chrome', 'chromium', 'firefox'] }, () => {

  const testModel = genBaseModel();

  beforeEach(() => {


    // TODO check with remote/auth:
    cy.request('post', '/api/dojo/models', testModel)
      .its('body').should('include', testModel.id);

    // const config = genConfig(testModel.id);
    // cy.request('post', '/api/dojo/dojo/config', config)
    //   .its('body').should('include', testModel.id);

    // The following config/directive endpoints have /dojo in their paths
    const directive = genDirective(testModel.id);

    // TODO check with remote/auth:
    cy.request('post', '/api/dojo/dojo/directive', directive)
      .its('body').should('include', testModel.id);

  });

  it('With templater open, annotating a config stores to system correctly', () => {

    cy.mount(
      <FullScreenTemplater
        content={{
          parameters: mockData.parameters,
          editor_content: mockData.editor_content,
          cwd: '/home/closeau/test-model',
          content_id: mockData.content_id
        }}
        contentChanged={false}
        open
        mode="config"
        modelId={testModel.id}
        setOpen={identity}
      />
    );

    cy.findByRole('button', {name: /^View All Parameters/i})
      .click();

    cy.findByRole('button', {name: /^Hide All Parameters/i})
      .click();

    cy.findAllByTestId('annotation-inner-contents')
      .eq(1)
      .trigger('mouseover');

    cy.findByTestId('annotate-tooltip-edit')
      .click();

    // The next 2 textbox are missing aria names. Use by order for now.

    cy.findAllByRole('textbox') // {name: /name/i}
      .eq(0)
      .clear()
      .type("second text");

    cy.findAllByRole('textbox') // {name: /description/i}
      .eq(1)
      .clear()
      .type('new second description');

    cy.findByRole('button', {name: /String \/ Text/i})
      .click();

    cy.findByRole('option', {name: /Float \/ Decimal Number/i})
      .click();

    cy.findByRole('button', {name: /Submit/i})
      .click();

    cy.findByRole('button', {name: /save/i})
      .click();

    cy.intercept('POST', `/api/dojo/dojo/config/`).as('CreatingConfig');
    // cy.wait('@CreatingConfig');
    cy.wait(1000);

    cy.request(`/api/dojo/dojo/config/${testModel.id}`)
      .its('body').should((response) => {
        expect(response[0].parameters[1].annotation.description).to.contain('new second description');
      });

  });

});
