import 'cypress-iframe';
import { genBaseModel, generatedIDs } from '../seeds/model_api_data';

const date = Date.now().toString();
const directiveCmd = `run file.txt --data=${date}`;
const modelName = `TestModel_created_at=${date}`;

import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import last from 'lodash/last';

import { createModel, provisionModelTerminal } from '../support/helpers';


const shutdownWorker = () => {
  return cy.request('GET', '/api/terminal/docker/locks')
    .then((lockResponse) => {

      console.log('shutdownWorker lock response', lockResponse);

      if (get(lockResponse, 'body.locks[0].modelId')) {

        const modelId = lockResponse.body.locks[0].modelId;

        console.log('locks present, clearing...', modelId);

        return cy.request('DELETE', `/api/terminal/docker/${modelId}/release`);
      }
    });
};


describe('Model Metadata: Creating a Model up to terminal step', () => {

  beforeEach(() => {
    shutdownWorker();
  });

  afterEach(() => {
    cy.location()
      .then((loc) => {
        const modelId = last(loc.pathname.split('/'));

        shutdownWorker().then(() => {
          console.log('Shut down. cleaning seeds for model:', modelId);
          cy.task('seed:clean', {type: 'model', id: modelId});
        });

      });
  });

  it('Creates a model with all the metadata fields and just the basic terminal steps', () => {
    cy.visit('/');
    cy.get('[data-test=landingPageModelForm]').click();
    // overview form
    cy.get('[data-test=modelForm-name]').type(modelName);
    cy.get('[data-test="modelForm-maintainer.website"]').clear().type('http://jataware.com');
    cy.get('[data-test=modelForm-family_name]').type('Test Family Name');
    cy.get('[data-test=modelForm-description]')
      .type('This is a test description. It is long enough.');
    cy.get('[data-test=modelFormOverviewNextBtn]').click();

    // detail form
    cy.get('[data-test="modelForm-maintainer.name"]').type('Maintainer Test Name');
    cy.get('[data-test="modelForm-maintainer.email"]').type('test@example.com');
    cy.get('[data-test="modelForm-maintainer.organization"]')
      .type('Maintainer Test Organization');
    cy.get('[data-test=modelFormStartDate]').type('01/01/2030');
    cy.get('[data-test=modelFormEndDate]').type('01/01/2040');

    // add domains
    cy.get('[data-test=modelFormDomain]').type('politi').then(() => {
      cy.contains('Political Science').click();
    });
    cy.get('[data-test=modelFormDomain]').type('medica').then(() => {
      cy.contains('Medical Science').click();
    });
    cy.get('[data-test=modelFormDetailNextBtn]').click();

    // region form
    cy.get('[data-test=modelFormExpandRegionBtn]').click();

    // add texas
    cy.get('[data-test=modelFormRegionSearch]').type('Texas').then(() => {
      cy.get('[data-test=modelFormRegionSearchBtn]').click();
      cy.contains('Texas, admin1').click();
      cy.get('[data-test=modelFormRegionSearchBtn]').click();
    });

    // check we have the correct region and nothing else
    cy.contains('Texas, admin1').should('exist');
    cy.contains('Los Angeles, admin2').should('not.exist');

    // add a region by coordinates
    cy.get('[data-test=modelFormExpandCoordsBtn]').click();
    cy.get('[data-test=modelForm-Lat1]').type('12');
    cy.get('[data-test=modelForm-Lng1]').type('21');
    cy.get('[data-test=modelForm-Lat2]').type('-12');
    cy.get('[data-test=modelForm-Lng2]').type('-21').then(() => {
      cy.get('[data-test=modelFormCoordsBtn]').click();
      // check that it showed up
      cy.contains('12 21, -12 -21').should('exist');
    });

    cy.get('[data-test=modelFormSubmitBtn]').click();
    // intercept our request to fetch the base images, so we aren't relying on dockerhub
    // and respond with the mock set of images in ../fixtures/images.json
    cy.intercept('GET', '/api/dojo/ui/base_images', { fixture: 'images.json' });
    cy.get('[data-test=selectImage]').click();
    cy.contains('Ubuntu').click();

    cy.get('[data-test=modelContainerLaunchBtn]').click();

    // create an alias for one of the endpoints that the terminal will hit when it loads
    cy.intercept('/api/dojo/dojo/outputfile/*').as('outputFiles');
    // and then wait until it is hit (give it an absurdly long time to timeout)
    cy.wait('@outputFiles', { timeout: 300000 });

    cy.wait(1000);

    // make sure xterm has loaded
    cy.get('.xterm-helper-textarea').should('exist');

    // watch for our requests for the shell history, so we know when we get the new directive
    cy.intercept('/api/dojo/terminal/container/history/*').as('shellHistory');

    // type in a directive
    cy.get('.xterm-helper-textarea').type(`${directiveCmd}{enter}`);

  });

});


describe('Model output annotation', () => {

  let modelId;

  it('Creates a file and edits with dojo edit', () => {

    shutdownWorker();

    modelId = undefined;

    const testModel = createModel(modelId);

    modelId = testModel.id;

    provisionModelTerminal(modelId).then(() => {
      cy.wait(5000);

      cy.visit(`/term/${testModel.id}`);

      cy.reload();

      const fileName = 'output_data.csv';
      const folderName = 'testmodel';

      cy.findByRole('textbox', {name: /terminal input/i})
        .type(`mkdir ${folderName}{enter}`)
        .type(`cd ${folderName}{enter}`)
        .type(`touch ${fileName}{enter}`)
        .type(`dojo edit ${fileName}{enter}`);

      cy.findByRole('button', {name: 'close'});

      cy.findByRole('textbox').as('EditingText');

      cy.get('@EditingText')
        .type('latitude,longitude,date,value,color_hue{enter}');

      cy.get('@EditingText')
        .type('60.4985255,-10.615118,1986-07-31,0.1237884593924997,#a04620{enter}28.5827915,-103.818624,2019-09-25,0.8583255955703992,#c61352{enter}28.5827915,-103.818624,2019-09-25,0.8583255955703992,#c61352{enter}-73.3958715,141.932549,1972-05-30,1.137030617734822,#f77bad{enter}62.866798,-57.143830,1993-07-11,1.917793049098565,#ea6b81{enter}', {force: true} );

      const saveUrl = `/api/terminal/container/${modelId}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

      cy.intercept('POST', saveUrl).as('SavingNewFile');

      cy.findByRole('button', {name: /save/i})
        .click();

      return cy.get('@SavingNewFile')
        .then(({request, response}) => {
          expect(request.query.path).to.contain(fileName);
          expect(request.body).to.contain('latitude');
          expect(response.body).to.equal('ok');
      });

    });
  });

  it('Annotate model output', () => {

    shutdownWorker();

    modelId = undefined;

    const testModel = createModel(modelId);

    modelId = testModel.id;

    provisionModelTerminal(modelId).then(() => {

      const fileName = 'output_data.csv';
      const folderName = 'testmodel';

      const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

      cy.wait(3000);

      cy.visit(`/term/${testModel.id}`);

      cy.reload();

      cy.findByRole('textbox', {name: /terminal input/i})
        .type(`mkdir ${folderName}{enter}`)
        .type(`cd ${folderName}{enter}`)
        .type(`touch ${fileName}{enter}`)
        .type('cd ..{enter}');


      cy.readFile('cypress/files/sample_output.csv').then((contents) => {
        cy
          .intercept('POST', `/api/dojo/job/${modelId}/tasks.model_output_analysis`)
          .as('FilePreAnalysis');

        return cy.request('POST', saveUrl, contents);
      }).then(() => {

        cy.findByRole('textbox', {name: /terminal input/i})
          .type(`cd ${folderName}{enter}dojo annotate ${fileName}{enter}`);

        cy.findByRole('button', {name: /close/i});

        cy.findByRole('textbox', {name: /Name/i}).type('named!');

        cy.findByRole('textbox', {name: /Description/i}).type('desc');

        cy.findByRole('textbox', {name: /Domains/i}).type('Logic');

        // NOTE Protects against current bug / race-condition (can click next until processed...)
        cy.wait('@FilePreAnalysis');

        cy.findAllByRole('button', {name: /Next/i}).click();

        cy.findAllByRole('button', {name: /Annotate/i, timeout: 65000})
          .eq(0)
          .click();

        cy.findByRole('textbox', {name: /Description/i})
          .type('hello lat lon');

        cy.findByRole('checkbox', {name: /This is my primary geo field/i})
          .click();

        cy.findByRole('checkbox', {name: /This is part of a coordinate pair/i})
          .click();

        cy.findByRole('button', {name: /geocoding level/i})
          .click();

        cy.findByRole('listbox').contains('Country')
          .click();

        cy.findByRole('button', {name: /save/i})
          .click();

        cy.findAllByRole('button', {name: /Annotate/i})
          .eq(0)
          .click();

        cy.findByRole('textbox', {name: /Description/i})
          .type('hello date');

        cy.findByRole('checkbox', {name: /This is my primary date field/i})
          .click();

        cy.findByRole('button', {name: /save/i})
          .click();

        cy.findAllByRole('button', {name: /Annotate/i})
          .eq(0)
          .click();

        cy.findByRole('textbox', {name: /units/i})
          .type('vals');

        cy.findAllByRole('textbox', {name: /Description/i})
          .eq(0)
          .type('hello feature');

        cy.findByRole('button', {name: /save/i})
          .click();

        cy.get('body').click();

        cy.wait(100);

        cy.findAllByRole('button', {name: /next/i})
          .eq(1)
          .click();

        // possible enhancement think about promises and discuss
        // cy.spyPoll('POST', `/api/dojo/job/${modelId}/elwood_processors.run_model_elwood`, 'status', 'finished');

        cy.intercept(`/api/dojo/indicators/${modelId}/preview/processed?filepath=model-output-samples/*.csv`, {timeout: 55000})
          .as('ProcessingPreviewPage');

        cy.intercept('PATCH', `/api/dojo/models/${modelId}`).as('SaveModelAnnotations');
        cy.intercept('POST', 'api/dojo/dojo/outputfile').as('CreateOutputFile');

        cy.findAllByRole('button', {name: /submit to dojo/i})
          .eq(1)
          .click();

        cy.get('@CreateOutputFile').should((intercept) => {
          expect(intercept.response.body).to.include(modelId);
        });

        cy.get('@SaveModelAnnotations').should((intercept) => {
          console.log('save model intercept', intercept);
          expect(intercept.request.body.outputs[0].name).to.equal('value');
        });

      });
    });

  });

  afterEach(() => {

    // Move out of terminal since it'll shut down.
    cy.visit('/admin');

    shutdownWorker().then(() => {
      console.log('Done clearing worker');
      cy.task('seed:clean', {type: 'model', id: modelId});
    });
  });

});


describe('Model Annotate directive', () => {

  let modelId;

  afterEach(() => {
    shutdownWorker().then(() => {
      console.log('Shut down. cleaning seeds');
      cy.task('seed:clean', {type: 'model', id: modelId});
    })
  });

  it('Opens panel to annotate directive', () => {

    const testModel = createModel(modelId);

    modelId = testModel.id;

    cy.request('GET', '/api/terminal/docker/locks').then((response) => {
      let promise;
      if (get(response, 'body.locks[0].modelId')) {
        if (get(response, 'body.locks[0].modelId') !== modelId) {
          promise = shutdownWorker().then(() => {
            return provisionModelTerminal(modelId);
          });
        }
      } else {
        promise = provisionModelTerminal(modelId);
      }
      return promise;
    }).then(() => {

      const fileName = 'output_data.csv';
      const folderName = 'testmodel';
      const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

      cy.visit(`/term/${testModel.id}`);

      cy.reload();

      cy.findByRole('textbox', {name: /terminal input/i})
        .type(`mkdir ${folderName}{enter}`)
        .type(`cd ${folderName}{enter}`)
        .type(`touch ${fileName}{enter}`)
        .type(`cat ${fileName}{enter}`);

      cy.readFile('cypress/files/sample_output.csv').then((contents) => {
        return cy.request('POST', saveUrl, contents);
      }).then(() => {

        cy
          .findByRole('table', {name: /enhanced table/i})
          .findAllByRole('button', {name: /mark as directive/i})
          .last()
          .click();

        cy.findByRole('dialog')
          .findByText(`cat ${fileName}`)

      });

    });

  });
});

describe('Model listings', () => {

  let modelId;
  let testModel;

  before(() => {
    testModel = createModel(modelId);
    modelId = testModel.id;
  });

  after(() => {
    console.log('Cleaning up seed test model:', modelId);
    cy.task('seed:clean', {type: 'model', id: modelId});
  });

  it('Existing model is found in Model List page', () => {

    cy.visit('/models');

    cy.get('[data-test=viewModelsSearchField]', { timeout: 10000 }).type(testModel.name);

    cy.findAllByRole('row')
      .eq(1)
      .as('ResultDataRow');

    cy.get('@ResultDataRow')
      .contains(testModel.name);
  });
});


describe('Model metadata form state navigation', () => {
  it('Keeps state when navigating away and then back', () => {
    cy.visit('/');
    cy.get('[data-test=landingPageModelForm]').click();
    cy.get('[data-test=modelForm-name]').type(modelName);
    cy.get('[data-test="modelForm-maintainer.website"]').clear().type('http://jataware.com');
    cy.get('[data-test=modelForm-family_name]').type('Test Family Name');
    cy.get('[data-test=modelForm-description]')
      .type('This is a test description. It is long enough.');
    cy.contains('This is a test description.');
    cy.get('[data-test=modelFormOverviewNextBtn]').click();

    // detail form
    cy.get('[data-test="modelForm-maintainer.name"]').type('Maintainer Test Name');
    cy.get('[data-test="modelForm-maintainer.email"]').type('test@example.com');
    cy.get('[data-test="modelForm-maintainer.organization"]')
      .type('Maintainer Test Organization');

    // wait for 1s here as we have a timeout built in to save the form state
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    // navigate as if we've hit the browser's back button
    cy.go('back');

    // navigate back to the model form
    cy.get('[data-test=landingPageModelForm]').click();
    // check that the continuing dialog is there
    cy.contains('Continuing from where you left off.');

    // check that at least one of our previous values are there
    cy.get('[data-test=modelFormDetailBackBtn]').click();
    cy.contains('This is a test description.');

    // clear the form
    cy.get('[data-test=stepperResetButton').click();
    cy.get('[data-test=confirmDialogYes').click();
    // and check that the first value is empty
    cy.get('[data-test=modelForm-name]').should('have.value', '');
  });
});

describe('Model Summary Page', () => {

  let modelId = undefined;

  it('All required Model properties are displayed on page', () => {

    // http://localhost:8080/api/terminal/docker/locks
    // modelId = 'acab2a55-8356-4029-99c2-734b4939293e';

    const testModel = createModel(modelId);

    modelId = testModel.id;

    cy
      .request('GET', '/api/terminal/docker/locks')
      .then((response) => {

        let promise;
        if (get(response, 'body.locks[0].modelId')) {
          if (get(response, 'body.locks[0].modelId') !== modelId) {
            promise = shutdownWorker().then(() => {
              return provisionModelTerminal(modelId);
            });
          }
        } else {
          promise = provisionModelTerminal(modelId);
        }

        return promise;
      })
      .then(() => {
        const fileName = 'output_data.csv';
        const folderName = 'testmodel';
        const user = 'clouseau';
        const homeDir = `/home/${user}`;

        const saveUrl = `/api/terminal/container/${testModel.id}/ops/save?path=/home/clouseau/${folderName}/${fileName}`;

        cy.visit(`/term/${testModel.id}`);

        cy.wait(10000); // TODO

        cy.reload();

        cy.findByRole('textbox', {name: /terminal input/i})
          .type(`mkdir ${folderName}{enter}`)
          .type(`cd ${folderName}{enter}`)
          .type(`touch ${fileName}{enter}`)
          .type(`touch parameters.json{enter}`)
          .type(`touch accessory.png{enter}`)
          .type('cd ..{enter}')
          .type(`cat ${folderName}/${fileName}{enter}`);

        cy.readFile('cypress/files/sample_output.csv').then((contents) => {
          return cy.request('POST', saveUrl, contents);
        });

        const urls = [

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
               "output_directory": `${homeDir}/${folderName}`,
               "path": fileName,
               "file_type": "csv",
               "transform": {
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
                 "annotation": {
                   "name": "const val",
                   "description": "leave default val",
                   "type": "str",
                   "default_value": "output_data",
                   "unit": "",
                   "unit_description": "",
                   "data_type": "nominal",
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

        ];

        const doneMocking = new Promise((resolve, reject) => {
          const METHOD = 0, URL = 1, BODY = 2;
          let succeeded = 0;
          urls.forEach((item, index) => {
            const name = `${item[URL]}-${index}`;
            console.log('url seed name', name);

            cy.request(item[METHOD], item[URL], item[BODY]).as(name);

            cy.get(`@${name}`).then((response) => {
              expect(response.status).to.match(/^2[0-1]+/);
              succeeded++;

              console.log('name', name, 'succeeded', succeeded);

              if (succeeded === urls.length) {
                resolve(true);
              } else if (index === urls.length - 1) {
                reject(false);
              }
            });
          });
        });

        doneMocking.then(() => {

          cy.request({
            method: 'GET',
            url: `/api/dojo/dojo/config/${modelId}`,
            failOnStatusCode: false
          }).then((response) => {

            cy.findByRole('button', {name: /save and continue/i})
              .click();

            cy.request({
              method: 'GET',
              url: `/api/dojo/dojo/outputfile/${modelId}`,
              failOnStatusCode: false
            }).then((res) => {
              console.log('res for outputfile', res);
              cy.reload();
            }).then(() => {
              cy.findByText(/Uploading Model to Docker.+/i);

              cy.wait(5000);

              cy.reload();

              cy.findByRole('heading', {name: /parameters\.json/i})

              cy.findAllByRole('heading', {name: /accessory\.png/i});

              cy.wait(5000);

              cy.reload();

              cy.findAllByRole('heading', {name: /Test-Output-Name/i});
            });
          });

        });
      });

  });

  afterEach(() => {
    shutdownWorker().then(() => {
      console.log('Shut down. cleaning seeds');
      cy.task('seed:clean', {type: 'model', id: modelId});
    });
  });

 xit('Can start edit Model process');
});
