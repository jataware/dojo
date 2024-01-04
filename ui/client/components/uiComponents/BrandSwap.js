import React from 'react';

const BrandSwap = ({ dojoComponent, ifpriComponent }) => {
  switch (process.env.COMPANY_BRANDING) {
    case 'dojo':
      return dojoComponent;
    case 'ifpri':
      return ifpriComponent;
    default:
      return null;
  }
};

export const BrandName = () => (
  <BrandSwap dojoComponent="Dojo" ifpriComponent="IFPRI" />
);

export default BrandSwap;
