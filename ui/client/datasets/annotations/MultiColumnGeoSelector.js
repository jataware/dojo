import React, { useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import invert from 'lodash/invert';
import { FormAwareSelect } from '../FormFields';
import { GEO_ADMINS } from './constants';

const mapAdminValueNumbers = invert(GEO_ADMINS);

/**
 *
 * */
const MultiColumnGeoSelector = ({
  columns, editingColumn, setFieldValue, disabled = false
}) => {
  const columnOptions = columns.map((column) => ({
    value: column.field,
    label: column.headerName
  }));

  // This needs to run only when changing the type|base, as
  // we hardcode the column's value (adminX option) to the columName being edited
  // and even disable that field (see disabled prop on the react tree below).
  useEffect(() => {
    if (!disabled) {
      // If we allow editing, we auto-set the "base" column name as its default geo_type
      const target = editingColumn.name;
      setFieldValue([`geo.multi-column.${mapAdminValueNumbers[editingColumn.geo_type]}`], target);
    }
  }, [editingColumn.geo_type, editingColumn.name, disabled, setFieldValue]);

  return (
    <FormControl variant="standard" fullWidth>
      <FormGroup>
        <Grid
          container
          spacing={2}
        >
          <Grid item xs={5}>
            <FormAwareSelect
              name="['geo.multi-column.admin0']"
              label="Country"
              disabled={disabled || (editingColumn.geo_type === GEO_ADMINS.admin0)}
              options={columnOptions}
            />
          </Grid>

          <Grid item xs={7}>
            <FormAwareSelect
              name="['geo.multi-column.admin1']"
              label="State/Territory"
              disabled={disabled || (editingColumn.geo_type === GEO_ADMINS.admin1)}
              options={columnOptions}
            />

          </Grid>

          <Grid item xs={5}>
            <FormAwareSelect
              name="['geo.multi-column.admin2']"
              label="County/District"
              disabled={disabled || (editingColumn.geo_type === GEO_ADMINS.admin2)}
              options={columnOptions}
            />

          </Grid>

          <Grid item xs={7}>
            <FormAwareSelect
              name="['geo.multi-column.admin3']"
              label="Municipality/Town"
              disabled={disabled || (editingColumn.geo_type === GEO_ADMINS.admin3)}
              options={columnOptions}
            />

          </Grid>
        </Grid>
      </FormGroup>
    </FormControl>
  );
};

export default MultiColumnGeoSelector;
