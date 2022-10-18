import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import BasicAlert from './BasicAlert';

function CSVDownload({ resource, index = 'indicators', className , wideFormat="false"}) {
  const [openDownload, setDownload] = useState(false);
  const name = `${resource.id}.csv`;
  let dataset_url= useState(`/api/dojo/dojo/download/${resource.id}/download/csv?wide_format=false`)

  const returnCorrectUrl= () =>{
    
    dataset_url='/api/dojo/indicators/'+`${dataset.id}`+'/download/csv?wide_format='+`${wideFormat}`
    //  for some reason it is adding on ,function () { [native code] } so I am removing that
    final_url=dataset_url.split(",")[0]
    return final_url
  }
  return (
    <>

      <Typography variant="body2" className={className}>
        <Button
          variant="outlined"
          color="primary"
          // href={(returnCorrectUrl())}
          href={`/api/dojo/dojo/download/csv/${index}/${resource.id}?wide_format=${wideFormat}`}
          download={name}
          type="text/csv"
          onClick={() => setDownload(true)}
          disabled={openDownload ? true : undefined}
        >
          Download CSV
        </Button>
      </Typography>
      <BasicAlert
        alert={
          {
            message: 'Please wait; Download may take a moment to start.',
            severity: 'info'
          }
        }
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        visible={openDownload}
        setVisible={setDownload}
        autoHideDuration={null}
        disableClickaway
        action={(
          <IconButton
            color="inherit"
            onClick={() => setDownload(false)}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      />
    </>
  );
}

export default CSVDownload;
