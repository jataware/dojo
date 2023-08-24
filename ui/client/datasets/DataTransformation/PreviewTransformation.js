import React, { useCallback, useEffect, useState } from 'react';

import clsx from 'clsx';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import useElwoodData from './useElwoodData';
import BasicAlert from '../../components/BasicAlert';

// Do all of this in a separate component so we can toggle when we start the hook
const Previewed = ({
  datasetId,
  jobString,
  createPreviewArgs,
  annotations,
  cleanupRef,
  setBefore,
  setAfter,
  setLoading,
  setError,
}) => {
  const onSuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
    if (Object.hasOwn(resp, 'rows_pre_clip')) {
      setData(resp);
    } else {
      setDataError(true);
    }
    setDataLoading(false);
  }, []);

  const { data: preview, error: previewError } = useElwoodData({
    datasetId,
    annotations,
    jobString,
    generateArgs: createPreviewArgs,
    cleanupRef,
    onSuccess,
  });

  useEffect(() => {
    if (previewError) {
      setLoading(false);
      setError(true);
    }
    if (
      preview
      && Object.hasOwn(preview, 'rows_pre_clip')
      && Object.hasOwn(preview, 'rows_post_clip')
    ) {
      setBefore(preview.rows_pre_clip);
      setAfter(preview.rows_post_clip);
      setLoading(false);
    }
  }, [preview, previewError, setAfter, setBefore, setLoading, setError]);

  return null;
};

const useStyles = makeStyles()(() => ({
  root: {
    width: '275px',
    margin: '0 auto',
  },
  titleWeight: {
    fontWeight: '500',
  },
  extraGutter: {
    marginBottom: '12px',
  },
  loadingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    opacity: '0.8',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardContent: {
    position: 'relative',
  },
}));

export default ({
  datasetId,
  jobString,
  createPreviewArgs,
  annotations,
  cleanupRef,
  disabled,
}) => {
  const { classes } = useStyles();
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [after, setAfter] = useState('___');
  const [before, setBefore] = useState('___');
  const [error, setError] = useState(false);

  const startPreview = () => {
    console.log('kicking off preview');

    setShowPreview(true);
    setLoading(true);
  };

  useEffect(() => {
    // don't render <Previewed> when we aren't in loading mode
    // so that we can fetch new content every time the user clicks the button
    if (showPreview && !loading) {
      setShowPreview(false);
    }
  }, [showPreview, loading]);

  return (
    <>
      <Card variant="outlined" className={classes.root}>
        <CardContent className={classes.cardContent}>
          {showPreview && (
            <Previewed
              datasetId={datasetId}
              jobString={jobString}
              createPreviewArgs={createPreviewArgs}
              annotations={annotations}
              cleanupRef={cleanupRef}
              setBefore={setBefore}
              setAfter={setAfter}
              setLoading={setLoading}
              setError={setError}
            />
          )}
          <Typography
            variant="subtitle1"
            className={classes.titleWeight}
            color="textSecondary"
            gutterBottom
          >
            before transformation:
          </Typography>
          <Typography variant="h5">
            {before} records
          </Typography>
          <Typography
            variant="subtitle1"
            className={clsx(classes.extraGutter, classes.titleWeight)}
            color="textSecondary"
          >
            after transformation:
          </Typography>
          <Typography variant="h5">
            {after} records
          </Typography>

          {loading && (
            <div className={classes.loadingWrapper}>
              <CircularProgress size={60} />
            </div>
          )}

        </CardContent>
        <CardActions>
          <Tooltip
            placement="bottom-start"
            title="Click to estimate the number of records after transformation"
            arrow
          >
            <span>
              <Button
                onClick={startPreview}
                disabled={loading || disabled}
                color="grey"
              >
                Preview
              </Button>
            </span>
          </Tooltip>
        </CardActions>
      </Card>
      <BasicAlert
        alert={{
          message: 'There was an issue previewing the data transformation. Please try again.',
          severity: 'warning'
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        visible={error}
        setVisible={setError}
      />
    </>
  );
};
