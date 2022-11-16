import 'cypress-iframe';

const date = Date.now().toString();
const directiveCmd = `run file.txt --data=${date}`;
const modelName = `TestName${date}`;
const configText = `test: ${date} \nmore text`;

describe('Creating a model', () => {
  /* use this to reconnect between tests (if developing in terminal) */
  // beforeEach(() => {
  //   cy.visit('/admin');
  //   cy.get('[data-test=adminReconnectLink]').click();
  // });

  /* this will fail gracefully if there isn't a worker running to shut down */
  const shutdownWorker = () => {
    /* give the shutdown endpoint an alias so we can know when it is complete */
    cy.intercept('/api/terminal/docker/*/release').as('shutdown');
    cy.visit('/admin');
    /* find our shutdown button */
    cy.get('[data-test=adminShutDownBtn]').then((btn) => {
      /* if it's not disabled */
      if (!btn[0].disabled) {
        /* wrap the returned button in a promise (necessary inside the .then) and click it */
        cy.wrap(btn).click();
        /* and wait for the shutdown endpoint to return */
        cy.wait('@shutdown', { timeout: 300000 });
      }
    });
  };

  /* shut before each tests, if we leave a model running */
  beforeEach(shutdownWorker);

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

    // make sure xterm has loaded
    cy.get('.xterm-helper-textarea').should('exist');

    // watch for our requests for the shell history, so we know when we get the new directive
    cy.intercept('/api/dojo/terminal/container/history/*').as('shellHistory');

    // type in a directive
    cy.get('.xterm-helper-textarea').type(`${directiveCmd}{enter}`);

    // and then force cypress to wait on the request we defined above
    cy.wait('@shellHistory');

    // then click the directive button
    cy.get('[data-test=terminalMarkDirectiveBtn]').last().click().then(() => {
      // cy.frameLoaded comes from cypress-iframe - https://gitlab.com/kgroat/cypress-iframe
      cy.frameLoaded({ url: '/api/shorthand' }, { timeout: 60000 }).then(() => {
        // once our iframe has loaded, invoke a postMessage on window for our base React
        // (ie not the shorthand angular iframe postmessage) to let it know the editor has loaded
        // which will then trigger React to send the appropriate details to shorthand
        cy.window().invoke('postMessage', JSON.stringify({ type: 'editor_loaded' }));

        // wait for shorthand to populate
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500).iframe().find('.editor-line').first()
          .setSelection(date)
          .then(() => {
            cy.iframe().find('#name').type('data');
            cy.iframe().find('#description').type('data description');
            cy.iframe().find('#data_type').select('freeform');
            cy.iframe().find('input[type=submit]').click();
          });

        cy.get('[data-test=fullScreenDialogSaveBtn]').click().then(() => {
          cy.window().then((win) => {
            // send this message to trigger the fullscreendialog to close
            win.postMessage(JSON.stringify({ type: 'params_saved' }));
          });
        });
      });
    });

    // take us to the summary page
    cy.get('[data-test=terminalSaveButton]').click();

    // first make sure the upload dialog appears
    cy.get('[data-test=summaryUploadDialog]').should('exist');

    // then give it a very long timeout to disappear in case the upload takes a long time
    cy.get('[data-test=summaryUploadDialog]', { timeout: 300000 }).should('not.exist');

    // stub out the actual publish calls so we don't do the final publish to causemos step
    cy.intercept('/api/dojo/models/*/publish', { statusCode: 200 });
    cy.intercept('/api/dojo/models/register/*', { statusCode: 200 });
    cy.get('[data-test=summaryPublishButton]').click();
    cy.get('[data-test=terminalSubmitConfirmBtn]').click();
  });

  it('Visits an existing model and does more things in the terminal', () => {
    cy.visit('/');
    cy.get('[data-test=landingPageViewModels]').click();
    cy.get('[data-test=viewModelsSearchField]', { timeout: 20000 }).type(modelName);
    // cy.wait(1000);
    cy.get('.MuiDataGrid-row').should((row) => {
      expect(row).to.contain(date);
      expect(row).to.have.length(1);
    }).then(() => {
      cy.get('[data-test=modelSummaryLink]').click();
    });

    // summary page
    cy.get('[data-test=introDialogFirstStepBtn]').click();
    cy.get('[data-test=introDialogStartOverBtn]').click();
    cy.window().then((win) => {
      // if we're still on the summary page, then we need to do a couple more steps
      if (win.location.pathname.includes('summary')) {
        cy.get('[data-test=introDialogConfirmNameField]').type(modelName);
        cy.get('[data-test=introDialogConfirmNameBtn]').click();
      }
    });

    // provision page
    cy.intercept('GET', '/api/dojo/ui/base_images', { fixture: 'images.json' });
    cy.get('[data-test=selectImage]').click();
    cy.contains('Ubuntu').click();
    cy.get('[data-test=modelContainerLaunchBtn]').click();

    // terminal page
    cy.intercept('/api/dojo/dojo/outputfile/*').as('outputFiles');
    cy.wait('@outputFiles', { timeout: 300000 });
    cy.get('.xterm-helper-textarea').should('exist');

    // create a file and add some text to it
    cy.get('.xterm-helper-textarea').type(`touch file${date}.txt {enter}`);
    cy.get('.xterm-helper-textarea').type(`dojo edit file${date}.txt {enter}`).then(() => {
      cy.get('[data-test=terminalEditorTextArea] textarea:first').type(configText);
      cy.get('[data-test=fullScreenDialogSaveBtn]').click();
    });

    // make the file into a config file
    cy.get('.xterm-helper-textarea').type(`dojo config file${date}.txt {enter}`).then(() => {
      cy.frameLoaded({ url: '/api/shorthand' }, { timeout: 60000 }).then(() => {
        cy.window().invoke('postMessage', JSON.stringify({ type: 'editor_loaded' }));

        // wait for a half second to give the iframe time to load its contents
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500).iframe().find('.editor-line').first()
          .setSelection(date);

        cy.iframe().find('#name').type('test name');
        cy.iframe().find('#description').type('test description');
        cy.iframe().find('#data_type').select('freeform');
        cy.iframe().find('input[type=submit]').click();

        cy.get('[data-test=fullScreenDialogSaveBtn]').click().then(() => {
          cy.window().then((win) => {
            // send this message to trigger the fullscreendialog to close
            win.postMessage(JSON.stringify({ type: 'params_saved' }));
          });
        });
      });
    });

    // create a simple CSV file for a model output/spacetag
    cy.get('.xterm-helper-textarea').type(`touch data${date}.csv {enter}`);
    cy.get('.xterm-helper-textarea').type(`dojo edit data${date}.csv {enter}`).then(() => {
      cy.get('[data-test=terminalEditorTextArea] textarea:first')
        .type('A,B\nC,D');

      cy.get('[data-test=fullScreenDialogSaveBtn]').click();
    });

    // enter the spacetag flow
    cy.get('.xterm-helper-textarea').type(`dojo annotate data${date}.csv {enter}`).then(() => {
      // wait until we've loaded the iframe before we start entering stuff
      cy.frameLoaded({ url: '/api/spacetag/byom' }).then(() => {
        cy.iframe().find('#dataset_Name').type('Test Dataset');
        cy.iframe().find('#dataset_Description').type('Test Description');
        cy.iframe().find('#resolution_spatial_x').type(1000);
        cy.iframe().find('#resolution_spatial_y').type(1000);
        cy.iframe().find('#submit').click();
      });
      // overview screen
      cy.frameLoaded({ url: '/api/spacetag/overview' }).then(() => {
        cy.iframe().contains('Annotate').first().click();
      });

      // annotation screen
      cy.frameLoaded({ url: '/annotate' }).then(() => {
        // spy on our call to go back to /overview
        cy.intercept('/api/spacetag/overview/*').as('overview');

        cy.iframe().find('#Description').type('description');
        cy.iframe().find('#Units').type('test units');
        cy.iframe().find('#Unit_Description').type('test unit description');
        cy.iframe().find('#Submit_annotation').click();

        // wait until the call to /overview responds
        cy.wait('@overview');
        // and then click submit on the next page
        cy.iframe().contains('Submit').click();
      });

      // spy on our 'done' response
      cy.intercept('/api/spacetag/overview/submit/send/*/done').as('spacetagDone');
      // submit screen
      cy.frameLoaded({ url: 'api/spacetag/overview/submit' }).then(() => {
        cy.iframe().contains('Submit to dojo').click();
      });

      // pause until this request finishes
      cy.wait('@spacetagDone', { timeout: 20000 });

      // then try to find and click our button
      cy.iframe().contains('Return to terminal').then((button) => {
        button.click();
      });
    });

    // create a fake image file
    cy.get('.xterm-helper-textarea').type(`touch image${date}.jpg {enter}`);
    // and tag it
    cy.get('.xterm-helper-textarea')
      .type(`dojo tag image${date}.jpg "this is an accessory file" {enter}`);
    cy.contains('Your accessory was successfully added').should('exist');

    // SWR mutate is not cooperating with the cypress iframe environment,
    // so navigate to the summary page and back to ensure the new files have loaded
    cy.get('[data-test=terminalSaveButton]').click();
    cy.get('[data-test=backToTerminalBtn').click();

    cy.get('[data-test=fileTabAccessories]').click().then(() => {
      cy.get('[data-test=fileCard]').filter(`:contains("image${date}.jpg")`)
        .should('have.length', 1);
    });

    cy.get('[data-test=fileTabConfigs]').click().then(() => {
      cy.get('[data-test=fileCard]').filter(`:contains("file${date}.txt")`)
        .should('have.length', 1);
    });

    cy.get('[data-test=fileTabOutputs]').click().then(() => {
      cy.get('[data-test=fileCard]').filter(`:contains("data${date}.csv")`)
        .should('have.length', 1);
    });

    cy.get('[data-test=terminalSaveButton]').click();

    // Add a region in the summary metadata editor
    cy.get('[data-test=summaryDetailsEditButton]').click().then(() => {
      cy.get('[data-test=modelFormExpandRegionBtn]').click().then(() => {
        cy.get('[data-test=modelFormRegionSearch]').type('New York').then(() => {
          cy.get('[data-test=modelFormRegionSearchBtn]').click();
          cy.contains('New York, admin1').click();
          cy.get('[data-test=modelFormRegionSearchBtn]').click();
        });
      });

      cy.get('[data-test=fullScreenDialogSaveBtn]').click();
    });

    // check that it got added
    cy.contains('Admin 1: Texas, New York');
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
