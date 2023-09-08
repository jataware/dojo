import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { pink } from '@mui/material/colors';
import { useStyles } from 'tss-react/mui';
import { scenarios } from './constants';

/**
 *
 **/
export function CheckboxLabels({labels, className=''}) {
  const { cx } = useStyles();
  return (
    <FormGroup className={cx([className])}>
      {labels.map(label => (
        <FormControlLabel
          key={label}
          control={<Checkbox
                     disableRipple
                     sx={{
                       color: pink[800],
                       '&.Mui-checked': {
                         color: pink[600],
                       },
                     }}
                   />}
          label={label}
        />
      ))}
    </FormGroup>
  );
}

export default (props) => {
  return (
    <CheckboxLabels labels={scenarios} {...props} />
  );
};
