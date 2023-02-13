import React, { useEffect, useRef, useState } from 'react';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  BarController,
  BarElement,
} from 'chart.js';
import {
  Chart
} from 'react-chartjs-2';

ChartJS.register(
  BarElement,
  CategoryScale,
  BarController,
  LinearScale,
  Title,
  Tooltip,
);

const data = {
  datasets: [{
    data: [20, 10, 5, 15, 20, 10, 25],
  }],
  labels: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul']
};

export default withStyles((theme) => ({
  controls: {
    paddingTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
  formControl: {
    minWidth: 120,
  },
}))(({
  classes,
}) => {
  const [startValue, setStartValue] = useState('');
  const [endValue, setEndValue] = useState('');
  const [displayData, setDisplayData] = useState(data);

  const handleScaleClick = () => {
    setDisplayData((prev) => ({
      datasets: [{
        // this is a very silly quick hack together: +3 to preserve what the user has selected
        // there's still something wonky about this, but since this isn't how we'll do it
        // in reality, no point spending more time fixing it right now for demo purposes
        data: prev.datasets[0].data.slice(startValue, endValue + 3),
      }],
      labels: prev.labels.slice(startValue, endValue + 3)
    }));
  };

  const handleChangeStart = (event) => {
    setStartValue(event.target.value);
  };

  const handleChangeEnd = (event) => {
    setEndValue(event.target.value);
  };

  const handleReset = () => {
    setDisplayData(data);
    setStartValue('');
    setEndValue('');
  };

  return (
    <div>
      <Typography align="center" variant="h5">Adjust Temporal Coverage</Typography>
      <Chart type="bar" data={displayData} />
      <div className={classes.controls}>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel>Start</InputLabel>
          <Select
            value={startValue}
            onChange={handleChangeStart}
            disabled={displayData !== data}
          >
            {data.labels.map((label, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <MenuItem value={index} key={index}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel>End</InputLabel>
          <Select
            value={endValue}
            onChange={handleChangeEnd}
            disabled={startValue === '' || displayData !== data}
          >
            {data.labels.slice(startValue).map((label, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <MenuItem value={index} key={index}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          disableElevation
          onClick={handleScaleClick}
          // only allow these to be set once before resetting
          disabled={displayData !== data}
        >
          Scale Time
        </Button>
        <Button
          variant="outlined"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
});
