import React, { useEffect, useState } from 'react';

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    padding: [[theme.spacing(1), theme.spacing(2), '10px']],
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'space-between',
  },
  tileContainer: {
    overflow: 'auto',
    fontSize: '10px',
    height: '100%',
    paddingBottom: theme.spacing(1),
    '& > *': {
      marginRight: '2px',
    },
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'center',
    '& > :first-child': {
      paddingTop: '10px',
    },
  },
  contentContainer: {
    // https://css-tricks.com/flexbox-truncated-text/
    minWidth: 0,
  },
}));

export default function FileCardList({
  name, files, loading, error, clickHandler, icon, cardContent, disableClick
}) {
  const [expanded, setExpanded] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    if (loading || error || !files.length) {
      setExpanded(true);
    }
  }, [loading, error, files]);

  const displayCards = () => {
    if (loading) {
      return <Typography variant="body2" align="center">{`Loading ${name} Files...`}</Typography>;
    }

    if (error) {
      return (
        <Typography variant="body2" align="center">
          {`There was an error loading ${name.toLowerCase()} files`}
        </Typography>
      );
    }

    if (!files.length) {
      return <Typography variant="body2" align="center">{`No ${name.toLowerCase()} files found`}</Typography>;
    }

    if (expanded) {
      return (
        <div
          className={classes.tileContainer}
        >
          {files.map((file) => (
            <Card
              key={file.id}
              className={classes.card}
            >
              <div className={classes.contentContainer}>
                {cardContent(file)}
              </div>
              <IconButton
                component="span"
                onClick={() => clickHandler(file)}
                disabled={disableClick}
              >
                {icon}
              </IconButton>
            </Card>
          ))}
        </div>
      );
    }
  };

  return (
    <>
      <span className={classes.headerContainer}>
        <Typography
          align="center"
          color="textSecondary"
          variant="h6"
          gutterBottom
        >
          {`${name} Files`}
        </Typography>
        <IconButton onClick={() => setExpanded((prevExpanded) => !prevExpanded)}>
          { expanded ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />}
        </IconButton>
      </span>
      {displayCards()}
    </>
  );
}
