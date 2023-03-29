import React, { useEffect, useState } from 'react';

import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

import useElwoodData from './useElwoodData';

const useStyles = makeStyles((theme) => ({
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
  previewRows: {
    height: '42px',
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

// Do all of this in a separate component so we can toggle when we start the hook
const Previewed = ({
  datasetId,
  jobString,
  onPreviewSuccess,
  createPreviewArgs,
  annotations,
  cleanupRef,
  setBefore,
  setAfter,
  setLoading,
}) => {
  const { data: preview, error: previewError } = useElwoodData({
    datasetId,
    annotations,
    jobString,
    generateArgs: createPreviewArgs,
    cleanupRef,
    onSuccess: onPreviewSuccess,
  });
  // TODO: handle previewError
  useEffect(() => {
    console.log('this is previewError', previewError)
    if (
      preview
      && Object.hasOwn(preview, 'rows_pre_clip')
      && Object.hasOwn(preview, 'rows_post_clip')
    ) {
      setBefore(preview.rows_pre_clip);
      setAfter(preview.rows_post_clip);
      setLoading(false);
    }
  }, [preview, previewError, setAfter, setBefore, setLoading]);

  return null;
};

export default ({
  datasetId,
  jobString,
  onPreviewSuccess,
  createPreviewArgs,
  annotations,
  cleanupRef,
  disabled,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [after, setAfter] = useState('___');
  const [before, setBefore] = useState('___');
  const classes = useStyles();

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
    <Card variant="outlined" className={classes.root}>
      <CardContent className={classes.cardContent}>
        {showPreview && (
          <Previewed
            datasetId={datasetId}
            jobString={jobString}
            onPreviewSuccess={onPreviewSuccess}
            createPreviewArgs={createPreviewArgs}
            annotations={annotations}
            cleanupRef={cleanupRef}
            setBefore={setBefore}
            setAfter={setAfter}
            setLoading={setLoading}
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
          {before} rows
        </Typography>
        <Typography
          variant="subtitle1"
          className={clsx(classes.extraGutter, classes.titleWeight)}
          color="textSecondary"
        >
          after transformation:
        </Typography>
        <Typography variant="h5">
          {after} rows
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
          title="Click to estimate the number of rows after transformation"
          arrow
        >
          <span>
            <Button onClick={startPreview} disabled={loading || disabled}>
              Preview
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
};
