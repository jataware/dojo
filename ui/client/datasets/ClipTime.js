import React, { useEffect, useRef, useState } from 'react';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import { enUS } from 'date-fns/locale';
import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  BarController,
  BarElement,
  PointElement,
  TimeScale,
  LineElement,
} from 'chart.js';
import {
  Chart
} from 'react-chartjs-2';

ChartJS.register(
  BarElement,
  CategoryScale,
  TimeScale,
  BarController,
  LinearScale,
  Title,
  Tooltip,
  PointElement,
  LineElement,
);

// const data = {
//   datasets: [{
//     data: [20, 10, 5, 15, 20, 10, 25],
//   }],
//   labels: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul']
// };

// const data = {
//   datasets: [{
//     data: [
//       { x: '2020-01-22', y: 0 },
//       { x: '2020-03-01', y: 0 },
//       { x: '2020-05-02', y: 0 },
//       { x: '2020-07-03', y: 0 },
//       { x: '2020-12-08', y: 0 },
//       { x: '2021-01-12', y: 0 },
//       { x: '2021-04-15', y: 0 },
//       { x: '2021-06-03', y: 0 },
//       { x: '2021-12-08', y: 0 },
//       { x: '2022-01-12', y: 0 },
//       { x: '2022-07-15', y: 0 }
//     ],
//   }]
// };

const options = {
  plugins: {
    legend: {
      display: false
    },

  },
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    // TODO: Style this as less ugly
    point: {
      radius: 5,
      backgroundColor: 'red',
      borderWidth: 1,
      borderColor: 'black',
    },
  },
  scales: {
    y: {
      display: false,
    },
    x: {
      type: 'time',
      adapters: {
        date: {
          locale: enUS
        },
      },
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
};

export default withStyles((theme) => ({
  loading: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(4),
    marginTop: theme.spacing(8),
  },
  controls: {
    paddingTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
  formControl: {
    minWidth: 120,
  },
  timelineWrapper: {
    height: '80px',
    marginTop: theme.spacing(10),
  },
}))(({
  classes, timeBounds
}) => {
  const [startValue, setStartValue] = useState(null);
  const [endValue, setEndValue] = useState(null);
  const [displayData, setDisplayData] = useState(null);

  const transformIntoDataset = (dates) => {
    const data = dates.map((date) => ({ x: date, y: 0 }));
    return { datasets: [{ data }] };
  };

  useEffect(() => {
    if (timeBounds.length > 1) {
      if (!startValue && !endValue) {
        setStartValue(timeBounds[0]);
        setEndValue(timeBounds[timeBounds.length - 1]);
      }

      if (!displayData) {
        setDisplayData(transformIntoDataset(timeBounds));
      }
    }
  }, [timeBounds, displayData, startValue, endValue]);

  // const handleScaleClick = () => {
  //   setDisplayData((prev) => ({
  //     datasets: [{
  //       // this is a very silly quick hack together: +3 to preserve what the user has selected
  //       // there's still something wonky about this, but since this isn't how we'll do it
  //       // in reality, no point spending more time fixing it right now for demo purposes
  //       data: prev.datasets[0].data.slice(startValue, endValue + 3),
  //     }],
  //     labels: prev.labels.slice(startValue, endValue + 3)
  //   }));
  // };

  // const handleReset = () => {
  //   setDisplayData(data);
  //   setStartValue('');
  //   setEndValue('');
  // };

  const handleChangeStart = (date) => {
    setStartValue(date);
    const ind = timeBounds.indexOf(date)
    const tb = timeBounds;
    debugger
  };

  const handleChangeEnd = (event) => {
    setEndValue(event.target.value);
  };

  return (
    <div>
      <Typography align="center" variant="h5">Scale Temporal Data</Typography>
      { startValue && endValue ? (
        <>
          <div className={classes.timelineWrapper}>
            <Chart type="line" data={displayData} options={options} />
          </div>
          <div className={classes.controls}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                label="Select a start date"
                value={startValue}
                onChange={handleChangeStart}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                label="Select an end date"
                value={endValue}
                onChange={handleChangeEnd}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </MuiPickersUtilsProvider>
          </div>
        </>
      ) : (
        <div className={classes.loading}>
          <Typography variant="subtitle1" align="center">
            Resolution Data Loading
          </Typography>
          <CircularProgress />
        </div>
      )}
        {/*<FormControl variant="outlined" className={classes.formControl}>
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
        </Button>*/}
    </div>
  );
});
