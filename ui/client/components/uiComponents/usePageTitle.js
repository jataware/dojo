import { useEffect } from 'react';

import { getBrandName } from './Branding';

// Sets the document title with the brand name from the environment variable
const usePageTitle = ({ title }) => {
  const brandName = getBrandName();
  useEffect(() => {
    document.title = `${title} - ${brandName}`;
  }, [brandName, title]);
};

export default usePageTitle;
