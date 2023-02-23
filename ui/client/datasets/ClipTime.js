import React, { useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import parse from 'date-fns/parse';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
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
      backgroundColor: '#1976d2',
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
          locale: enUS,
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

// ChartJS demands this date format
const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';

const transformIntoDataset = (dates) => {
  console.log('this is dates', dates)
  const data = dates.map((date) => ({ x: date, y: 0 }));
  return { datasets: [{ data }] };
};

export default withStyles((theme) => ({
  loading: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(4),
    marginTop: theme.spacing(8),
  },
  datepickers: {
    margin: theme.spacing(6),
    display: 'flex',
    justifyContent: 'space-around',
  },
  formControl: {
    minWidth: 120,
  },
  timelineWrapper: {
    height: '80px',
    marginTop: theme.spacing(10),
  },
  timelineButtonsWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(5),
  },
  saveButtonWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: [[theme.spacing(8), theme.spacing(4)]],
  }
}))(({
  classes,
  timeBounds,
  setSavedTimeBounds,
  savedTimeBounds,
  closeDrawer,
}) => {
  const [startValue, setStartValue] = useState(() => {
    if (savedTimeBounds) return savedTimeBounds[0];
    return null;
  });
  const [endValue, setEndValue] = useState(() => {
    console.log('do we have savedTimeBounds???', savedTimeBounds)
    if (savedTimeBounds) return savedTimeBounds[savedTimeBounds.length - 1];
    return null;
  });
  const [displayData, setDisplayData] = useState(() => {
    if (savedTimeBounds) return transformIntoDataset(savedTimeBounds);
    return null;
  });
  const [invalidDates, setInvalidDates] = useState(false);

  useEffect(() => {
    if (timeBounds.length > 1) {
      if (!startValue && !endValue) {
        setStartValue(timeBounds[0]);
        setEndValue(timeBounds[timeBounds.length - 1]);
      }

      if (!displayData?.datasets) {
        console.log('setting???', transformIntoDataset(timeBounds))
        setDisplayData(transformIntoDataset(timeBounds));
      }
    }
  }, [timeBounds, displayData, startValue, endValue]);

  const handleReset = () => {
    setDisplayData(transformIntoDataset(timeBounds));
    setStartValue(timeBounds[0]);
    setEndValue(timeBounds[timeBounds.length - 1]);
  };

  const handleChangeStart = (date) => {
    console.log('this is value we saving', date)
    // check that the date is valid
    const validDate = isValid(date);
    if (!validDate) {
      // and if it isn't, disable the submit & crop buttons
      setInvalidDates(true);
      // but still set it as the value so the date picker will work
      setStartValue(date);
      return;
    }
    console.log('are we getting back here???')
    // if endValue is also currently valid, make sure the buttons are enabled
    const parsed = parse(endValue, DEFAULT_DATE_FORMAT, new Date());
    if (isValid(parsed)) {
      console.log('and in here???', parsed)
      setInvalidDates(false);
    }
    console.log('what about here', isValid(endValue))
    // if everything is valid, format the date down to this instead of the full date string
    const formattedDate = format(date, DEFAULT_DATE_FORMAT);
    setStartValue(formattedDate);
  };

  const handleChangeEnd = (date) => {
    const validDate = isValid(date);
    if (!validDate) {
      setInvalidDates(true);
      setEndValue(date);
      return;
    }

    const parsed = parse(startValue, DEFAULT_DATE_FORMAT, new Date());
    if (isValid(parsed)) {
      setInvalidDates(false);
    }

    const formattedDate = format(date, DEFAULT_DATE_FORMAT);
    setEndValue(formattedDate);
  };

  const handleSelectDates = () => {
    const filteredDates = timeBounds.filter((savedDate) => {
      const date = new Date(savedDate);
      if (new Date(startValue) > date || new Date(endValue) < date) {
        return false;
      }
      return true;
    });

    filteredDates.unshift(startValue);
    filteredDates.push(endValue);
    setDisplayData(transformIntoDataset(filteredDates));
  };

  const handleSave = () => {
    // only save the date, not the full datasets object ChartJS needs
    const dateList = displayData.datasets[0].data.map((date) => date.x);
    setSavedTimeBounds(dateList);
    closeDrawer();
  };

  return (
    <div>
      <Typography align="center" variant="h5">Select Temporal Coverage</Typography>
      { displayData ? (
        <>
          <div className={classes.timelineWrapper}>
            <Chart type="line" data={displayData} options={options} />
          </div>
          <div className={classes.datepickers}>
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

          <div className={classes.timelineButtonsWrapper}>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={handleSave}
              // only allow these to be set once before resetting
              disabled={!displayData || invalidDates}
            >
              Save & Close
            </Button>
            <div>
              <Button
                variant="outlined"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                color="primary"
                disableElevation
                onClick={handleSelectDates}
                // only allow these to be set once before resetting
                disabled={!displayData || invalidDates}
              >
                Crop Coverage
              </Button>
            </div>
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
    </div>
  );
});
