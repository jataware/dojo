import React, {
  useEffect,
  useState,
} from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import { useHistory } from 'react-router-dom';

const LandingPage = () => {
  const history = useHistory();
  const [dojoVersion, setDojoVersion] = useState('0.0.0');

  const fetchVersion = async () => {
    const resp = await fetch('/dojo/version');
    if (resp.ok) {
      setDojoVersion(await resp.text());
    } else {
      console.log(`failed to retrieve version info ${resp.status}`);
    }
  };

  useEffect(() => {
    fetchVersion();
  }, []);

  const configureContainer = () => {
    history.push('/intro');
  };

  return (
    <>
      <Box>
        Dojo
        {' '}
        {dojoVersion}
      </Box>
      <Button variant="contained" color="primary" onClick={configureContainer}>
        Configure Container
      </Button>
    </>
  );
};

export default LandingPage;
