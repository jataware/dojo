import React, { useState } from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { makeStyles } from '@material-ui/core/styles';

import { useAuth } from '../auth';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const ToggleRole = ({ updateRole }) => {
  const classes = useStyles();
  const [selectedRole, setSelectedRole] = useState('');
  const { auth } = useAuth();

  const handleSelectRole = (event) => {
    setSelectedRole(event.target.value);
    // Also update the parent component on the selected role
    updateRole(event.target.value);
  };

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel id="organization">Organization</InputLabel>
      <Select
        label-id="organization"
        id="organization"
        value={selectedRole}
        label="Organization"
        onChange={handleSelectRole}
      >
        <MenuItem value="">All organizations</MenuItem>
        {auth?.dojo_roles?.map((role) => {
          const displayName = role.replace(/-|_/g, ' ');
          return <MenuItem key={role} value={role}>{displayName}</MenuItem>;
        })}
      </Select>
      <FormHelperText>
        Select the organization you would like to create/view content for
      </FormHelperText>
    </FormControl>
  );
};

export default ToggleRole;
