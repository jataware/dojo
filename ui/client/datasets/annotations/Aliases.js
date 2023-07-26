import React from 'react';

import { FieldArray } from 'formik';
import isEmpty from 'lodash/isEmpty';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { withStyles } from '@mui/material/styles';

import { FormAwareTextField } from '../FormFields';

const validateField = (value) => {
  let errorMessage;
  if (!value || value === '') {
    errorMessage = 'Required, or remove alias';
  }
  return errorMessage;
};

/**
 *
 * */
export const Aliases = withStyles((theme) => ({
  root: {
  },
  aliases: {
    maxHeight: '14rem',
    overflowY: 'auto',
    listStyle: 'none'
  },
  alias: {
    display: 'flex',
  },
  arrow: {
    // this exactly vertically centers the arrow
    // even when the form error height change would cause flex centering to fail
    marginTop: theme.spacing(2),
  }
}))(({
  classes, aliases, disabled
}) => (
  <FieldArray
    name="aliases"
    render={(arrayHelpers) => (

      <div className={classes.root}>
        <Tooltip
          title="Substitute specific cell values in your column. Set a 'current' value to be
            replaced and a 'new' value to display. E.g. 'Current: undefined,
            New: 0' changes 'undefined' cells to '0'."
          placement="right"
          arrow
        >
          <Button
            onClick={() => arrayHelpers.push({ id: aliases.length, current: '', new: '' })}
            color="primary"
            disabled={disabled}
            startIcon={<AddCircleIcon />}
          >
            Add Alias
          </Button>
        </Tooltip>
        <ul className={classes.aliases}>
          {aliases && !isEmpty(aliases)
            && aliases.map((alias, idx) => (
              <li
                className={classes.alias}
                key={alias.id}
              >
                <FormAwareTextField
                  name={`aliases.${idx}.current`}
                  margin="dense"
                  label="Current"
                  required
                  disabled={disabled}
                  validate={validateField}
                />
                <div className={classes.arrow}>
                  <ArrowRightIcon />
                </div>
                <FormAwareTextField
                  name={`aliases.${idx}.new`}
                  margin="dense"
                  label="New"
                  required
                  disabled={disabled}
                  validate={validateField}
                />
                {!disabled && (
                  <Tooltip title="Remove Alias">
                    <IconButton
                      color="secondary"
                      onClick={() => arrayHelpers.remove(idx)}
                      style={{ height: '48px' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </li>
            ))}
        </ul>
      </div>
    )}
  />
));
Aliases.displayName = 'Aliases';
