import React, { useState, useEffect } from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import InlineDocLink from '../../components/uiComponents/InlineDocLink';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const NodeBase = ({
  children, title, style, previews = [], logPreviews = []
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // parse the title with dashes for the link to the docs
  const dashedTitle = title.toLowerCase().split(' ').join('-');
  const parsedLink = `data-modeling.html#${dashedTitle}-node`;

  useEffect(() => {
    if (paused) return; // Exit early if paused

    const images = showLog ? logPreviews : previews;
    if (images.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 2000); // Change image every 2 seconds

      return () => clearInterval(interval);
    }
  }, [previews, logPreviews, showLog, paused]);

  const handleImageClick = () => {
    setPaused(!paused);
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 500); // Show overlay for 500ms
  };

  const renderPreviews = () => {
    const images = showLog ? logPreviews : previews;
    return (
      <div style={{ marginTop: '8px', padding: '8px' }}>
        {images.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Typography variant="caption" sx={{ fontSize: '0.875rem' }}>
                Preview:
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={showLog}
                    onChange={() => setShowLog(!showLog)}
                    color="primary"
                    size="small"
                  />
                }
                label={<Typography variant="caption" sx={{ fontSize: '0.875rem' }}>Log</Typography>}
                labelPlacement="start"
                sx={{ margin: 0 }}
              />
            </div>
            <div
              style={{
                position: 'relative',
                backgroundColor: 'white',
                border: '1px solid lightgrey',
                borderRadius: '4px',
                padding: '8px',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
              onClick={handleImageClick}
            >
              <img
                src={`data:image/png;base64,${images[currentIndex]}`}
                alt={`Preview ${currentIndex}`}
                style={{
                  width: '100%',
                  borderRadius: '4px'
                }}
              />
              {showOverlay && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '50%',
                    padding: '10px'
                  }}
                >
                  {paused ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={style}>
      <Typography variant="subtitle2" sx={{ padding: 1 }}>
        {title}
        <InlineDocLink link={parsedLink} title={`${title} Node`} />
      </Typography>
      {children && (
        <>
          <Divider />
          <div style={{ padding: '16px' }}>
            {children}
          </div>
        </>
      )}
      {(previews.length > 0 || logPreviews.length > 0) && renderPreviews()}
    </div>
  );
};

export default NodeBase;