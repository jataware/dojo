import React, { useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import DateFnsUtils from '@date-io/date-fns';
import { enUS } from 'date-fns/locale';

import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  PointElement,
  TimeScale,
  LineElement,
  LineController,
} from 'chart.js';
import {
  Chart
} from 'react-chartjs-2';

import PreviewTransformation from './PreviewTransformation';

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  Title,
  Tooltip,
  PointElement,
  LineElement,
  LineController,
);

const options = {
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        title: (context) => {
          //  chartjs will use its default if nothing is returned
          if (context[0].raw) {
            let title = '';
            const date = parseISO(context[0].raw.x);
            if (isValid(date)) {
              title = format(date, 'MM/dd/yyyy');
            }
            return title;
          }
        },
        label: () => '',
      }
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  elements: {
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
    // check that the date is valid
    const validDate = isValid(date);
    if (!validDate) {
      // and if it isn't, disable the submit & crop buttons
      setInvalidDates(true);
      // but still set it as the value so the date picker will work
      setStartValue(date);
      return;
    }

    // if endValue is also currently valid, make sure the buttons are enabled
    const parsed = parseISO(endValue);
    if (isValid(parsed)) {
      setInvalidDates(false);
    }

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

    const parsed = parseISO(startValue);
    if (isValid(parsed)) {
      setInvalidDates(false);
    }

    const formattedDate = format(date, DEFAULT_DATE_FORMAT);
    setEndValue(formattedDate);
  };

  const handleSelectDates = () => {
    // remove all the dates that are before or after the selected dates
    const filteredDates = timeBounds.filter((savedDate) => {
      const date = new Date(savedDate);
      if (new Date(startValue) > date || new Date(endValue) < date) {
        return false;
      }
      return true;
    });

    // and add our two new dates to the front and back of the array
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

  const header = <Typography align="center" variant="h5">Select Temporal Coverage</Typography>;

  if (timeBounds.length === 1) {
    return (
      <>
        {header}
        <Typography align="center" variant="subtitle1" className={classes.loading}>
          Temporal coverage can only be modified on datasets with multiple dates.
        </Typography>
        <Typography align="center" variant="subtitle1">
          This dataset only has a single date: <b>{timeBounds[0]}</b>.
        </Typography>
      </>
    );
  }

  const minDate = parseISO(timeBounds[0]);
  const maxDate = parseISO(timeBounds[timeBounds.length - 1]);

  return (
    <div>
      {header}
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
                /* We need to parse the value to keep it from jumping back one day */
                value={parseISO(startValue)}
                onChange={handleChangeStart}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                minDate={minDate}
                maxDate={maxDate}
              />
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                label="Select an end date"
                value={parseISO(endValue)}
                onChange={handleChangeEnd}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                minDate={minDate}
                maxDate={maxDate}
              />
            </MuiPickersUtilsProvider>
          </div>

          <div className={classes.timelineButtonsWrapper}>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={handleSave}
              disabled={!displayData || invalidDates}
            >
              Save & Close
            </Button>
            <div>
              <Button
                variant="outlined"
                onClick={handleReset}
                style={{ marginRight: '16px' }}
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
          <PreviewTransformation rows={400} />
        </>
      ) : (
        <div className={classes.loading}>
          <Typography variant="subtitle1" align="center">
            Temporal Bounds Loading
          </Typography>
          <CircularProgress />
        </div>
      )}
    </div>
  );
});
