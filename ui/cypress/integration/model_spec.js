describe('Creating a model', () => {
  it('Clicks through to the model form', () => {
    cy.visit('/');
    cy.contains('A Model');
    cy.get('[data-test=modelFormGoBtn]').click();
    // overview form
    cy.get('[data-test=modelForm-name]').type('Test Name');
    cy.get('[data-test="modelForm-maintainer.website"]').clear().type('http://jataware.com');
    cy.get('[data-test=modelForm-family_name]').type('Test Family Name');
    cy.get('[data-test=modelForm-description]').type('This is a test description');
    cy.get('[data-test=modelFormOverviewNextBtn]').click();
    // detail form
    cy.get('[data-test="modelForm-maintainer.name"]').type('Maintainer Test Name');
    cy.get('[data-test="modelForm-maintainer.email"]').type('test@example.com');
    cy.get('[data-test="modelForm-maintainer.organization"]').type('Maintainer Test Organization');
    cy.get('[data-test=modelFormStartDate]').type('01/01/2030');
    cy.get('[data-test=modelFormEndDate]').type('01/01/2040');
    cy.get('[data-test=modelFormCategory]').type('this creates four categories ');
    cy.get('[data-test=modelFormDetailBackBtn]').click();
    // back to overview form - select input by name because material ui
    cy.get('[name=name]').should('have.value', 'Test Name');
    cy.get('[data-test=modelFormOverviewNextBtn]').click();
    cy.get('[name="maintainer.name"]').should('have.value', 'Maintainer Test Name');
    cy.get('[data-test=modelFormDetailNextBtn]').click();
    // region form
    cy.get('[data-test=modelFormExpandRegionBtn]').click();
    cy.get('[data-test=modelFormRegionSearch]').type('New York');
    cy.get('[data-test=modelFormRegionSearchBtn]').click();
    cy.contains('New York, admin1').click();
    // add new york
    cy.get('[data-test=modelFormRegionSearchBtn]').click();
    cy.get('[data-test=modelFormRegionSearch]').type('Los Angeles');
    cy.get('[data-test=modelFormRegionSearchBtn]').click();
    cy.contains('Los Angeles, admin2').should('exist');
    // don't add LA
    cy.get('[data-test=modelFormRegionClearBtn').click();
    cy.get('[data-test=modelFormRegionSearch]').type('Texas');
    cy.get('[data-test=modelFormRegionSearchBtn]').click();
    cy.contains('Texas, admin1').click();
    // add texas
    cy.get('[data-test=modelFormRegionSearchBtn]').click();
    // check we have the correct regions
    cy.contains('New York, admin1').should('exist');
    cy.contains('Texas, admin1').should('exist');
    cy.contains('Los Angeles, admin2').should('not.exist');
    // coordinates form
    cy.get('[data-test=modelFormExpandCoordsBtn]').click();
    cy.get('[data-test=modelForm-Lat1]').type('12');
    cy.get('[data-test=modelForm-Lng1]').type('21');
    cy.get('[data-test=modelForm-Lat2]').type('-12');
    cy.get('[data-test=modelForm-Lng2]').type('-21');
    cy.get('[data-test=modelFormCoordsBtn]').click();
    // check it showed up
    cy.contains('12 21, -12 -21').should('exist');

    cy.get('[data-test=modelFormSubmitBtn]').click();
  });
});
