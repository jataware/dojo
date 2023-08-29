import React from 'react';

import { FieldArray } from 'formik';

import isEmpty from 'lodash/isEmpty';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import FormikTextField from '../formikComponents/FormikTextField';

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100%',
  },
  subtextWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
   padding: `0 ${theme.spacing(2)} ${theme.spacing(1)}`,
  },
  addButton: {
    minWidth: '120px',
    paddingLeft: theme.spacing(1),
  },
  subtext: {
    maxWidth: '300px',
  },
}));

const ParameterOptions = ({ options }) => {
  const { classes } = useStyles();
  return (
    <FieldArray
      name="options"
      render={(arrayHelpers) => (
        <div className={classes.root}>
          <List dense>
            {options && !isEmpty(options) && options.map((option, index) => (
              // using the index is what the formik docs use for this, even though one
              // would expect it to cause issues with re-rendering when you remove items
              // eslint-disable-next-line react/no-array-index-key
              <ListItem key={index}>
                <FormikTextField
                  name={`options.${index}`}
                  margin="dense"
                  label={`#${index + 1}`}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => arrayHelpers.remove(index)} color="secondary" size="large">
                          <DeleteIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </ListItem>
            ))}
          </List>
          <div className={classes.subtextWrapper}>
            <Typography variant="caption" className={classes.subtext}>
              Make sure that the choices you specify are valid values for this parameter
            </Typography>
            <Button
              className={classes.addButton}
              color="primary"
              onClick={() => arrayHelpers.push('')}
              size="small"
              startIcon={<AddCircleIcon />}
            >
              Add Option
            </Button>
          </div>
        </div>
      )}
    />
  );
};

export default ParameterOptions;
