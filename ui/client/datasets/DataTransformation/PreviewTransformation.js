import React, { useState } from 'react';

import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
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

  const startPreview = () => {
    console.log('kicking off preview');
    setShowPreviewLoading(true);
    setTimeout(() => {
      setShowPreview(!showPreview);
      setShowPreviewLoading(false);
    }, 1000);
  };

  const previewSection = () => {
    if (showPreviewLoading) {
      return (
        <div className={classes.previewRows}>
          <CircularProgress size={30} className={classes.loading} />
          <Typography variant="body2" align="center">
            Loading...
          </Typography>
        </div>
      );
    }

    if (showPreview) {
      return (
        <Typography className={classes.previewRows} variant="h5">
          47 rows
        </Typography>
      );
    }

    return (
      <Typography className={classes.previewRows} variant="body2">
        Click <b>Preview</b> to estimate the number of rows after transformation
      </Typography>
    );
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

        {previewSection()}
      </CardContent>
      <CardActions>
        <Button onClick={startPreview} disabled={showPreviewLoading}>
          Preview
        </Button>
      </CardActions>
    </Card>
  );
});
