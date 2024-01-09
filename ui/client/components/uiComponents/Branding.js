import React from 'react';

// can handle full component swapping as well as simple text, as below
export const BrandSwap = ({ dojo, ifpri }) => {
  switch (process.env.COMPANY_BRANDING) {
    case 'dojo':
      return dojo;
    case 'ifpri':
      return ifpri;
    default:
      // default to dojo if no env variable
      return dojo;
  }
};

// component name swap to easily drop into JSX text
export const BrandName = () => (
  <BrandSwap dojo="Dojo" ifpri="IFPRI" />
);

// function variant to fetch the brand name as text, not as a component
// used outside of components or in other non-JSX contexts
export const getBrandName = () => (BrandSwap({ dojo: 'Dojo', ifpri: 'IFPRI' }));
