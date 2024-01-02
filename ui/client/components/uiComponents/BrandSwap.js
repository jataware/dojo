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

export default BrandSwap;
