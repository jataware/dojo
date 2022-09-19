import React from 'react';
import { mount } from '@cypress/react';
import identity from 'lodash/identity';
import ColumnPanel from '../../client/datasets/annotations/ColumnPanel';

describe('ColumnPanel', () => {

  it('Displays validation error when submitting form with both primary field + qualifies another.', () => {

    mount(
      <ColumnPanel
        columnName="ravioli"
        headerName="That Value"
        columns={['col1', 'col2']}

        annotations={{}}
        annotateColumns={identity}
        inferredData={null}

        multiPartData={{}}
        setMultiPartData={identity}
      />
    );

    cy.findByText(/A primary column cannot be marked as a qualifier./i)
      .should('not.exist');

    cy.findByRole('button', {name: /^Type/i})
      .click();

    // Select Geo type
    cy.findAllByRole('option').eq(1)
      .click();

    cy.findAllByRole('checkbox', {name: /This is my primary geo field/i})
      .click();

    cy.findAllByRole('checkbox', {name: /Field qualifies another/i})
      .click();

    cy.findAllByRole('button', {name: /save/i})
      .click();

    // We should now have a validation error
    cy.findByText(/A primary column cannot be marked as a qualifier./i)
      .should('exist');

  });

});
