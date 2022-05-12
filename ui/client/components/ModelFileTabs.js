import React, { useState } from 'react';

import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

import FileList from './FileList';
import SummaryAccessories from './SummaryAccessories';
import { useAccessories, useConfigs, useOutputFiles } from './SWRHooks';

// give each tab correct accessibility attributes (according to MUI docs)
const a11yProps = (index) => ({
  id: `file-tab-${index}`,
  'aria-controls': `file-tabpanel-${index}`,
});

const useStyles = makeStyles((theme) => ({
  indicator: {
    margin: [[0, theme.spacing(1)]],
  },
  textWrapper: {
    color: theme.palette.common.white,
  },
}));

function TabPanel(props) {
  const {
    children, value, index, ...other
  } = props;

  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`file-tabpanel-${index}`}
      aria-labelledby={`file-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Typography component="div" className={classes.textWrapper}>
          <Box p={1}>
            {children}
          </Box>
        </Typography>
      )}
    </div>
  );
}

const ModelFileTabs = ({
  model, setShorthandMode, setShorthandContents, setOpenShorthand,
  setSpacetagOpen, setSpacetagFile,
}) => {
  const [tabValue, setTabValue] = useState(0);

  const { accessories } = useAccessories(model.id);
  const { outputs } = useOutputFiles(model.id);
  const { configs } = useConfigs(model.id);

  const classes = useStyles();

  const handleTabClick = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Tabs
        value={tabValue}
        onChange={handleTabClick}
        variant="fullWidth"
        style={{ color: 'white' }}
        indicatorColor="primary"
        classes={{ indicator: classes.indicator }}
      >
        <Tab
          label={`Configs  (${configs?.length || 0})`}
          data-test="fileTabConfigs"
          {...a11yProps(0)}
        />
        <Tab
          label={`Outputs  (${outputs?.length || 0})`}
          data-test="fileTabOutputs"
          {...a11yProps(1)}
        />
        <Tab
          label={`Accessories  (${accessories?.length || 0})`}
          data-test="fileTabAccessories"
          {...a11yProps(2)}
        />
      </Tabs>
      <div style={{ overflowY: 'scroll' }}>
        <TabPanel value={tabValue} index={0}>
          <FileList
            fileType="config"
            model={model}
            setShorthandMode={setShorthandMode}
            setShorthandContents={setShorthandContents}
            setOpenShorthand={setOpenShorthand}
            hideExpandHeader
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <FileList
            fileType="outputfile"
            model={model}
            setSpacetagOpen={setSpacetagOpen}
            setSpacetagFile={setSpacetagFile}
            hideExpandHeader
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <SummaryAccessories modelId={model.id} hideExpandHeader />
        </TabPanel>
      </div>
    </>
  );
};

export default ModelFileTabs;
