import React from 'react';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';
import LinearProgress from '@material-ui/core/LinearProgress';

import { calculateHighlightTargets } from './utils';

export const ConfidenceBar = withStyles(() => ({
  root: {
    height: 15,
  },
  colorPrimary: {
    border: '1px solid gray',
    backgroundColor: 'transparent',
    background: 'repeating-linear-gradient( -45deg, gray, gray 1px, white 1px, white 4px )'
  },
  bar: {
    backgroundColor: '#00cd00',
  },
}))(LinearProgress);

export const ParagraphTile = withStyles(() => ({
  root: {
    padding: '0.5rem 1.5rem',
    margin: '0.75rem 0',
    border: '1px solid #B2dfee',
    borderRadius: 2,
    background: '#f9f9f9',
    boxShadow: '4px 4px 8px 0px #9a999969',
    cursor: 'pointer',
    '& dl > div': { display: 'flex' },
    '& dd': { margin: 0 }
  },
  squareChip: {
    borderRadius: 0,
    background: '#e7e6e6',
    marginRight: '0.75rem'
  },
  chipLabel: {
    fontWeight: 'bold',
    width: '4rem',
    display: 'flex',
    justifyContent: 'center'
  }
}))(({
  classes, paragraph, highlights = null, query, onClick
}) => {
  const handleClick = () => onClick(paragraph);

  return (
    // eslint-disable-next-line max-len
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={classes.root}
      onClick={handleClick}
    >
      <Typography
        variant="body1"
        component="div"
      >

        <dl>
          <div style={{ alignItems: 'center', marginBottom: '1rem' }}>
            <dt>
              <Chip classes={{ root: classes.squareChip, label: classes.chipLabel }} label="ID" />
            </dt>
            <dd>{paragraph.id}</dd>
          </div>

          <div style={{ alignItems: 'center', marginBottom: '1rem' }}>
            <dt>
              <Chip classes={{ root: classes.squareChip, label: classes.chipLabel }} label="Title" />
            </dt>
            <dd>{paragraph.parent_document.title || 'No Title Available'}</dd>
          </div>

          {paragraph.parent_document.publisher && (
            <div style={{ alignItems: 'center', marginBottom: '1rem' }}>
              <dt>
                <Chip classes={{ root: classes.squareChip, label: classes.chipLabel }} label="Publisher" />
              </dt>
              <dd>{paragraph.parent_document.publisher}</dd>
            </div>
          )}

          <div>
            <dt>
              <Chip classes={{ root: classes.squareChip, label: classes.chipLabel }} label="text" />
            </dt>
            <dd>{(highlights || calculateHighlightTargets(paragraph.text, query))
              .map((partInfo, idx) => (
                <span
                  key={idx}
                  style={partInfo.highlight
                    ? { fontWeight: 'bold', background: 'yellow' }
                    : {}}
                >
                  {partInfo.text}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Chip classes={{ root: classes.squareChip, label: classes.chipLabel }} label="Hit%" />
          <div style={{ display: 'block', width: '8rem' }}>
            <ConfidenceBar
              value={Math.sqrt(paragraph?.metadata?.match_score || 0) * 100}
              variant="determinate"
            />
          </div>
        </div>
      </Typography>

      <br />
    </div>
  );
});
