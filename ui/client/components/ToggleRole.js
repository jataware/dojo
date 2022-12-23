import React, { useEffect, useState } from 'react';

import FormControl from '@material-ui/core/FormControl';
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

const ToggleRole = () => {
  const classes = useStyles();
  const { auth, adminRole, setDojoAdmin } = useAuth();

  const [selectedRole, setSelectedRole] = useState(() => {
    // we can get adminRole as a 'null' string from localstorage if it isn't set
    // so explicitly check for that here
    if (!adminRole || adminRole === 'null') {
      // Get the first role from our list of roles(skip over any potential falsy values)
      return auth.admin_roles.find(Boolean);
    }

    return adminRole;
  });

  useEffect(() => {
    // keep adminRole up to date with selectedRole
    if (selectedRole !== adminRole) {
      setDojoAdmin(selectedRole);
    }
  }, [adminRole, selectedRole, setDojoAdmin]);

  const handleSelectRole = (event) => {
    setSelectedRole(event.target.value);
  };

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel id="role">Select a Role</InputLabel>
      <Select
        label-id="role"
        id="role"
        value={selectedRole}
        label="Role"
        onChange={handleSelectRole}
        margin="dense"
      >
        {auth.admin_roles?.map((role) => {
          const displayName = role.replace(/-|_/g, ' ');
          return <MenuItem key={role} value={role}>{displayName}</MenuItem>;
        })}
      </Select>
    </FormControl>
  );
};

export default ToggleRole;
