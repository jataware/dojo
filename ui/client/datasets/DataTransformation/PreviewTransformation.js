import React, { useState } from 'react';

import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

export default withStyles((theme) => ({
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
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    opacity: '0.8',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loading: {
    display: 'block',
    margin: [[theme.spacing(1), 'auto']],
  },
}))(({
  classes,
  rows,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showPreviewLoading, setShowPreviewLoading] = useState(false);
  const [after, setAfter] = useState('___');

  const startPreview = () => {
    console.log('kicking off preview');
    setShowPreviewLoading(true);
    setTimeout(() => {
      setShowPreview(!showPreview);
      setAfter(after === '___' ? '47' : '___');
      setShowPreviewLoading(false);
    }, 1000);
  };

  return (
    <Card variant="outlined" className={classes.root}>
      <CardContent>
        <Typography
          variant="subtitle1"
          className={classes.titleWeight}
          color="textSecondary"
          gutterBottom
        >
          before transformation:
        </Typography>
        <Typography variant="h5">
          {rows} rows
        </Typography>
        <Typography
          variant="subtitle1"
          className={clsx(classes.extraGutter, classes.titleWeight)}
          color="textSecondary"
        >
          after transformation:
        </Typography>
        <div style={{ position: 'relative' }}>
          <Typography className={classes.previewRows} variant="h5">
            {after} rows
          </Typography>
          {showPreviewLoading && (
            <div className={classes.loadingWrapper}>
              <CircularProgress size={30} className={classes.loading} />
            </div>
          )}
        </div>

      </CardContent>
      <CardActions>
        <Tooltip
          placement="bottom-start"
          title="Click to estimate the number of rows after transformation"
          arrow
        >
          <Button onClick={startPreview} disabled={showPreviewLoading}>
            Preview
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
});
