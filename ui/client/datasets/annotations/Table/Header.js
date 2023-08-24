import React from 'react';
import clsx from 'clsx';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';

import TimelineIcon from '@mui/icons-material/Timeline'; // feature
import LanguageIcon from '@mui/icons-material/Language'; // geo
import EventIcon from '@mui/icons-material/Event'; // date
// import { keyframes } from '@emotion/react';

// TODO use colors from theme
const inferredColor = '#337288'; // inferred/hint/"action" blue-gray
const annotatedColor = '#66BB6A'; // green

const mapStatusColor = {
  default: 'inherit',
  inferred: inferredColor,
  annotated: annotatedColor,
  primary: annotatedColor
};

const mapTypeIcon = {
  feature: TimelineIcon,
  geo: LanguageIcon,
  time: EventIcon // date
};

// MUI-TODO: animation is not displaying properly in v5, sort this out later
// const buttonPulse = keyframes`
//   from {
//     outline 2px solid #86b5e3;
//   }
//   to {
//     outline: 2px solid white;
//   }
// `;

const useStyles = makeStyles()((theme) => ({
  multipartRoot: {
    position: 'absolute',
    left: 0,
    top: '8px',
    display: 'flex',
    justifyContent: 'center',
  },
  categoryIconArea: {
    marginLeft: theme.spacing(1),
  },
  upperWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: [[theme.spacing(1), 0]],
  },
  upperWrapperMulti: {
    // left margin to keep the button centered between the columns (accounting for the icon)
    marginLeft: theme.spacing(3),
    // make it sit on top of the other header pieces to ensure our button hover always works
    zIndex: 101,
    top: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.6rem',
    padding: [[0, theme.spacing(0.5)]],
  },
  selectedHeader: {
    fontWeight: 'bold'
  },
  headerWrapper: {
    width: '100%',
  },
  // very specific styling in this divider to replicate the Datagrid column header separator
  divider: {
    right: '-1px',
    width: '2px',
    position: 'absolute',
    height: '14px',
    top: '33px',
  },
  highlightedButton: {
    backgroundColor: theme.palette.grey[100],
  },
}));

const MultiPartHeader = ({
  status, colSpan, TypeIcon, qualifies, showMarkers, buttonClick, column
}) => {
  const { classes } = useStyles();
  const shouldDisplayStatus = ((['inferred', 'primary'].includes(status) || qualifies));

  return (
    <div
      className={classes.multipartRoot}
      style={{ width: `${colSpan * 100}%` }}
    >
      {showMarkers && shouldDisplayStatus && (
        <Typography
          variant="caption"
          className={clsx([classes.statusBadge])}
        >
          {qualifies ? 'qualifier' : status}
        </Typography>
      )}
      <div className={clsx([classes.upperWrapper, classes.upperWrapperMulti])}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => buttonClick(column)}
          color="grey"
        >
          Edit
        </Button>
        {TypeIcon && (
          <TypeIcon className={classes.categoryIconArea} />
        )}
      </div>
      <Divider orientation="vertical" className={classes.divider} />
    </div>

  );
};

const Header = ({
  isHighlighted,
  status,
  isMultiPartMember, isMultiPartBase, colSpan,
  heading,
  category, // type
  qualifies,
  showMarkers,
  addingAnnotationsAllowed,
  column,
  buttonClick,
  drawerOpen = false,
}) => {
  const { classes } = useStyles();
  const isAnnotated = ['annotated', 'primary'].includes(status);
  const isInferred = status === 'inferred' && !isMultiPartMember;
  // only display the status badge if it is inferred or primary OR it is a qualifier
  const shouldDisplayStatus = (
    (['inferred', 'primary'].includes(status) || qualifies) && !isMultiPartMember
  );

  const TypeIcon = mapTypeIcon[category];

  const isInferredButDisabled = isInferred && !showMarkers;

  return (

    <div
      style={{ color: !isInferredButDisabled && mapStatusColor[status] }}
      className={classes.headerWrapper}
    >

      {isMultiPartBase && (
        <MultiPartHeader
          colSpan={colSpan}
          status={status}
          qualifies={qualifies}
          TypeIcon={TypeIcon}
          showMarkers={showMarkers}
          column={column}
          buttonClick={buttonClick}
        />
      )}

      {(addingAnnotationsAllowed || isAnnotated) && (
        <div
          className={classes.upperWrapper}
          // padding when an icon is present to keep the button centered
          style={{ paddingLeft: TypeIcon ? '24px' : 0, }}
        >
          <Button
            variant="outlined"
            disabled={isMultiPartMember}
            // MUI-TODO
            // sx={{
            //   animation: isHighlighted && !isAnnotated ? `${buttonPulse} 1.5s infinite alternate` : '',
            // }}
            style={{ visibility: isMultiPartMember ? 'hidden' : 'visible' }}
            size="small"
            color="grey"
            onClick={() => buttonClick(column)}
            /* Disable the pulse animation when the drawer is open or once it's annotated */
            className={
              isHighlighted && !isAnnotated && !drawerOpen
                ? classes.highlightedButton : null
            }
          >
            {isAnnotated ? 'Edit' : 'Annotate'}
          </Button>

          {!isMultiPartMember && (
            <>
              {showMarkers && shouldDisplayStatus && (
                <Typography variant="caption" className={classes.statusBadge}>
                  {/* a qualifier can't be primary, and its status can no longer be inferred */}
                  {qualifies ? 'qualifier' : status}
                </Typography>
              )}

              {TypeIcon && (
                <TypeIcon className={classes.categoryIconArea} />
              )}
            </>
          )}
        </div>
      )}

      <Typography
        className={clsx({ [classes.selectedHeader]: isHighlighted })}
        variant="subtitle1"
        align="center"
      >
        {heading}
      </Typography>

      {/* let MultiPartHeader add its own single Divider at the end of however many columns */}
      {!isMultiPartMember && <Divider orientation="vertical" className={classes.divider} />}
    </div>
  );
};

export default Header;
