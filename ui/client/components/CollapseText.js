import React, { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const CollapseText = ({ childrenText, collapsedSize = 60 }) => {
  const [display, setDisplay] = useState(false);
  const cellValue = useRef(null);
  const wrapper = useRef(null);
  const [currentlyOverflown, setCurrentlyOverflown] = useState(false);

  const handleClick = () => {
    setDisplay((prev) => !prev);
  };

  useEffect(() => {
    const isOverflown = (el) => (
      el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
    );
    const handleCheckTextSize = () => {
      const overflown = isOverflown(cellValue.current);
      setCurrentlyOverflown(overflown);
    };

    handleCheckTextSize();
  }, []);

  // todo: only show collapse if content is over a certain height
  return (
    <div ref={wrapper}>
      <div>
        <Collapse
          ref={cellValue}
          in={display}
          collapsedSize={collapsedSize}
        >
          {childrenText}
        </Collapse>
        { currentlyOverflown

          && (
          <div>

            <Box textAlign="center">
              <Tooltip title={`${display ? 'Hide' : 'Expand'} content`} arrow>
                <IconButton size="small" onClick={handleClick}>
                  {display ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Tooltip>
            </Box>
          </div>
          )}
      </div>
    </div>
  );
};

export default CollapseText;
