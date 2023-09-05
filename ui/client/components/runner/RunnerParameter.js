/* eslint-disable camelcase */

import React from 'react';

import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import { makeStyles } from 'tss-react/mui';

import HelperTip from '../HelperTip';
import FormikTextField from '../formikComponents/FormikTextField';
import FormikSelect from '../formikComponents/FormikSelect';
import { isNum, patchOptions } from './runnerTools';

const makeOptionConverter = (type, option) => ({
  label: option,
  value: isNum(type) ? Number(option) : option
});

const useStyles = makeStyles()(() => ({
  runField: {
    display: 'flex',
    flexDirection: 'column',
  },
  fieldHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
}));

const RunnerParameter = ({
  default_value,
  description,
  name,
  options,
  predefined,
  type,
  unit,
  unit_description,
  min,
  max,
}) => {
  const { classes } = useStyles();
  const minWarning = min ? `'${name}' ≥ ${min}.` : '';
  const maxWarning = max ? `'${name}' ≤ ${max}.` : '';
  const limitWarning = min + max ? `${minWarning} ${maxWarning}` : undefined;

  const parsedOptions = patchOptions(options, default_value).map(
    (option) => makeOptionConverter(type, option)
  );

  return (
    <ListItem
      key={name}
      className={classes.runField}
      alignItems="flex-start"
    >
      <div className={classes.fieldHeader}>
        <ListItemText
          primary={description}
          secondary={limitWarning}
        />
        <HelperTip
          title={`${unit}: ${unit_description}`}
          dark
        />
      </div>
      {predefined ? (
        <FormikSelect
          name={name}
          margin="dense"
          label={`${name} (${unit})`}
          variant="outlined"
          options={parsedOptions}
        />
      ) : (
        <FormikTextField
          name={name}
          margin="dense"
          label={`${name} (${unit})`}
          variant="outlined"
        />
      )}

    </ListItem>
  );
};

export default RunnerParameter;
