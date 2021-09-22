import React from 'react';

import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import { darken, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    padding: [[theme.spacing(1), theme.spacing(2), '10px']],
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: darken(theme.palette.grey[300], 0.1),
    },
    display: 'flex',
    justifyContent: 'space-between',
  },
  tileContainer: {
    overflow: 'auto',
    fontSize: '10px',
    paddingBottom: theme.spacing(1),
    '& > *': {
      marginRight: '2px',
    },
  },
}));

export default function FileCardList({
  name, files, loading, error, clickHandler, icon, cardContent
}) {
  const classes = useStyles();
  if (loading) {
    return <Typography variant="body2" align="center">{`Loading ${name} Files...`}</Typography>;
  }

  if (error) {
    return (
      <Typography variant="body2" align="center">
        {`There was an error loading ${name} files`}
      </Typography>
    );
  }

  if (!files.length) {
    return <Typography variant="body2" align="center">{`No ${name} files found`}</Typography>;
  }

  return (
    <>
      <Typography
        align="center"
        color="textSecondary"
        variant="h6"
        gutterBottom
      >
        {`${name} Files`}
      </Typography>
      <div className={classes.tileContainer}>
        {files.map((file) => (
          <Card
            key={file.id}
            className={classes.card}
          >
            <div>
              {cardContent(file)}
            </div>
            <IconButton
              component="span"
              onClick={() => clickHandler(file)}
            >
              {icon}
            </IconButton>
          </Card>
        ))}
      </div>
    </>
  );
}
