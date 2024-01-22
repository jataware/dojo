import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

function isOverflown(element) {
  return (
    element.scrollHeight > element.clientHeight
    || element.scrollWidth > element.clientWidth
  );
}

const ExpandableDataGridCell = React.memo((props) => {
  const { width, value } = props;
  const wrapper = React.useRef(null);
  const cellDiv = React.useRef(null);
  const cellValue = React.useRef(null);
  const textMeasureRef = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showFullCell, setShowFullCell] = React.useState(false);
  const [showPopper, setShowPopper] = React.useState(false);
  const [popperWidth, setPopperWidth] = React.useState(width);

  const handleMouseEnter = () => {
    const isCurrentlyOverflown = isOverflown(cellValue.current);
    setShowPopper(isCurrentlyOverflown);
    setAnchorEl(cellDiv.current);
    setShowFullCell(true);

    // Split value into words and find the longest one
    const words = value.split(' ');
    const longestWord = words.reduce((word1, word2) => (
      word1.length > word2.length ? word1 : word2
    ), '');

    // Measure the width of the longest word
    textMeasureRef.current.textContent = longestWord;
    const measuredWidth = textMeasureRef.current.offsetWidth;

    if (measuredWidth > width) {
      const requiredWidth = measuredWidth + 16; // 16px for padding
      setPopperWidth(requiredWidth);
    } else {
      setPopperWidth(width); // Use default width
    }
  };

  const handleMouseLeave = () => {
    setShowFullCell(false);
  };

  React.useEffect(() => {
    if (!showFullCell) {
      return undefined;
    }

    function handleKeyDown(nativeEvent) {
      // IE11, Edge (prior to using Bink?) use 'Esc'
      if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
        setShowFullCell(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowFullCell, showFullCell]);

  return (
    <Box
      ref={wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        alignItems: 'center',
        lineHeight: '24px',
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
      }}
    >
      <Box
        ref={cellDiv}
        sx={{
          height: '100%',
          width,
          display: 'block',
          position: 'absolute',
          top: 0,
        }}
      />
      <Box
        ref={cellValue}
        sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {value}
      </Box>
      {/*
        Hidden span for measuring text width,
        positioned offscreen so it doesn't interfere with layout
      */}
      <span
        ref={textMeasureRef}
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          visibility: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
      {showPopper && (
        <Popper
          open={showFullCell && anchorEl !== null}
          anchorEl={anchorEl}
          style={{ width: popperWidth, marginLeft: -17 }}
        >
          <Paper
            elevation={1}
            style={{ minHeight: wrapper.current.offsetHeight - 3 }}
          >
            <Typography variant="body2" style={{ padding: 8 }}>
              {value}
            </Typography>
          </Paper>
        </Popper>
      )}
    </Box>
  );
});

export default ExpandableDataGridCell;
