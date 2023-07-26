import React, { useEffect, useState } from 'react';

import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';

import { makeStyles } from '@mui/material/styles';
import { useHistory, useLocation } from 'react-router-dom';

import axios from 'axios';
import { ErrorBoundary } from 'react-error-boundary';
import { DefaultErrorFallback } from '../components/DefaultErrorFallback';
import Prompt from './PromptDialog';
import flows from './Flows';

const useStyles = makeStyles(({ spacing, breakpoints }) => ({
  root: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: [[spacing(0.5), spacing(2), spacing(2), spacing(2)]],
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resetButton: {
    opacity: 0.6,
    '&:hover': {
      opacity: 1,
    },
  },
  buttonOverride: {
    height: '20px',
  },
  stepperWrapper: {
    width: '85%',
    '& .MuiStepLabel-labelContainer': {
      [breakpoints.down('md')]: {
        display: 'none'
      }
    }
  },
  stepperTooltip: {
    fontSize: spacing(2)
  },
  stepperTooltipWraper: {
    display: 'none',
    [breakpoints.down('md')]: {
      display: 'block'
    }
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: spacing(2),
    marginBottom: spacing(2),
    marginLeft: '40%',
    marginRight: '40%',
  },
  contentWrapper: {
    display: 'flex',
    flex: 1,
  }
}));

const defaultDatasetState = {
  id: null,
  name: '',
  family_name: null,
  description: '',
  deprecated: false,
  published: false,
  domains: [],
  maintainer: {
    email: '',
    name: '',
    website: '',
    organization: '',
  },
  data_sensitivity: null,
  data_quality: null,
  data_paths: [],
  outputs: [],
  qualifier_outputs: [],
  tags: [],
  fileData: {
    raw: {
      uploaded: false,
      url: null,
    }
  }
};

/**
 *
 **/
function getRawFileNameFromLocation(location) {
  const params = new URLSearchParams(location.search);
  const filename = params.get('filename');

  return filename;
}

/**
 * Given we're in the Dataset Update Metadata flow, we should
 * find and use the first raw file uploaded (which may vary by extension).
 *
 * NOTE Only potential "bug" (user error?) being, if the user first uploads 1
 * file, then somehow does not finish registration and uses this ID to navigate
 * to append flow, we might _append_ a second file, then go through register
 * flow using the second file, which would mean the update flow would be borked
 * (since it wants to use the first file, not the second.) * TODO verify note.
 **/
function getUpdateRawFileName(uploadedRawFileNames) {
  // raw_data. dot is important. Other appended files continue as "raw_data_#.<extension>"
  const firstFileMatch = uploadedRawFileNames.find((fileName) => fileName.startsWith('raw_data.'));

  if (!firstFileMatch) {
    throw (new Error('Unable to update a Dataset without a previously uploaded file.'));
  }

  return firstFileMatch;
}

const InnerStepper = ({ match, updateLocation, ...props }) => {
  const { flowslug, step, datasetId } = match?.params;
  const shouldUpdateLocation = updateLocation === undefined ? true : Boolean(updateLocation);

  const history = useHistory();
  const classes = useStyles();
  const location = useLocation();
  const flow = flows[flowslug];

  const [activeStep, setActiveStep] = React.useState(() => {
    // Start at step as defined by url path
    if (datasetId && step) {
      const stepNum = flow.steps.findIndex((flowStep) => flowStep.slug === step);
      if (stepNum >= 0) return stepNum;
    }
    return 0;
  });

  const [rawFileName, setRawFileName] = useState(null);
  const [uploadedFilesData, setUploadedFilesData] = useState({});

  useEffect(() => {
    let stepNum = 0;
    if (datasetId && step) {
      stepNum = flow.steps.findIndex((flowStep) => flowStep.slug === step);
      if (stepNum < 0) stepNum = 0;
    }
    setActiveStep(stepNum);

    // Set activeStep every time the page changes (because it doesn't function as a SPA
    // so we can't rely on state to persist)
  }, [location, datasetId, flow.steps, step]);

  const [datasetInfo, setDatasetInfo] = useState(() => cloneDeep(defaultDatasetState));

  const [annotations, setAnnotations] = useState({
    metadata: {},
    annotations: {},
  });

  const [error, setError] = useState(null);
  const [displayError, setDisplayError] = useState(false);

  useEffect(() => {
    document.title = 'Dataset Registration - Dojo';

    let rawFileNameToUse = getRawFileNameFromLocation(location);

    if (rawFileNameToUse) {
      setRawFileName(rawFileNameToUse);
    }

    if (datasetId) {
      axios({
        method: 'get',
        url: `/api/dojo/indicators/${datasetId}/verbose`,
      }).then((result) => {
        /* Set loaded dataset info, uploaded files data, and annotations */

        const uploadedFiles = get(result, 'data.annotations.metadata.files', {});

        if (!rawFileNameToUse) {
          const allRawFileNames = Object.keys(uploadedFiles);
          /* We have a datasetId and are coming back to the register flow,
           * which means we should display the previously uploaded file
           * (we only upload files when a created dataset exists). If there's
           * no query param, there should be AT LEAST 1 uploaded file.
           * If there is only one uploaded file, we can safely assume and help the user by
           * displaying the file. If there's more than 1 file, we have no way to know which
           * file they should work with, except if in the `filename` url search param.
           * In the future we could prompt the user to select which previously uploaded
           * file they wish to work with.
           */
          if ((flowslug === 'register') && allRawFileNames.length === 1) {
            rawFileNameToUse = allRawFileNames[0];
          }

          if (flowslug === 'update') {
            rawFileNameToUse = getUpdateRawFileName(allRawFileNames);
            setRawFileName(rawFileNameToUse);
          }
        }

        const uploadedFileName = get(uploadedFiles, `['${rawFileNameToUse}'].filename`, null);

        setUploadedFilesData(uploadedFiles);

        setDatasetInfo({
          ...result.data.indicators,
          fileData: {
            raw: {
              uploaded: Boolean(uploadedFileName),
              url: uploadedFileName,
              rawFileName: rawFileNameToUse
            }
          }
        });

        setAnnotations(result.data.annotations);
      }).catch((e) => {
        const { response } = e;

        if (response.status === 404) {
          setError({
            code: response.status,
            title: response.statusText,
            message: `A Dataset with id ${datasetId} was not found. Please verify and reload the page.`
          });
        } else {
          setError({
            ...e,
            code: response.status,
            title: 'An Error Occurred'
          });
        }

        setDisplayError(true);
      });
    }
  // Fetch data & update the page every time we change location
  // activeStep changes too late and will cause this to run twice
  }, [datasetId, flowslug, location]);

  const handleBack = () => {
    let prevStep = flow.steps[activeStep - 1];
    if (prevStep.component.SKIP) {
      prevStep = flow.steps[activeStep - 2];
    }

    const newPath = `/datasets/${flowslug}/${prevStep.slug}/${datasetInfo.id}`;

    if (shouldUpdateLocation) {
      history.push(newPath + history.location.search);
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = ({
    dataset, filename
  } = {}) => {
    const currentStep = flow.steps[activeStep];
    const nextStep = flow.steps[activeStep + 1];
    const datasetId_ = datasetInfo.id || dataset?.id;

    // Search sets up previously uploaded file, if applicable.
    //   If not applicable, it preserves the previous search (eg '?some=value'),
    //   which defaults to empty string '' if none.
    const search = filename ? `?filename=${filename}` : history.location.search;
    const newPath = `/datasets/${flowslug}/${nextStep.slug}/${datasetId_}${search}`;
    if (filename) {
      setRawFileName(filename);
    }

    if (shouldUpdateLocation) {
      if (currentStep.component.SKIP) {
        history.replace(newPath);
      } else {
        history.push(newPath);
      }
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const displayFormStep = () => {
    const currentStep = flow.steps[activeStep];
    const FormComponent = currentStep.component;

    return (
      <FormComponent
        {...props}
        datasetInfo={datasetInfo}
        setDatasetInfo={setDatasetInfo}
        annotations={annotations}
        setAnnotations={setAnnotations}
        rawFileName={rawFileName}
        setRawFileName={setRawFileName}
        stepLabel={currentStep.label}
        stepTitle={currentStep.title}
        handleNext={handleNext}
        handleBack={handleBack}
        {...flow.steps[activeStep].options}
        // {...flow.states}
        uploadedFilesData={uploadedFilesData}
        error={error}
      />
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.navigation}>

        <div className={classes.stepperWrapper}>
          <Stepper activeStep={activeStep}>
            {flow.steps.map((mappedStep, index) => (
              <Tooltip
                classes={{
                  tooltip: classes.stepperTooltip,
                  popper: classes.stepperTooltipWraper
                }}
                key={mappedStep.label}
                title={mappedStep.label}
              >
                <Step completed={index < activeStep}>
                  <StepLabel>
                    <Typography variant="h5">
                      {mappedStep.label}
                    </Typography>
                  </StepLabel>
                </Step>
              </Tooltip>
            ))}
          </Stepper>
        </div>
      </div>

      <div className={classes.contentWrapper}>
        <ErrorBoundary FallbackComponent={DefaultErrorFallback}>
          { displayFormStep() }
        </ErrorBoundary>
      </div>

      <Prompt
        open={displayError}
        title={error?.title}
        message={error?.message}
        handleClose={() => setDisplayError(false)}
      />

    </div>
  );
};

const HorizontalLinearStepper = ({ match, updateLocation, ...props }) => {
  const { flowslug } = match?.params;
  // Return "404" immediately if the flow slug doesn't exist
  if (!flows.hasOwnProperty(flowslug)) {
    // TODO: Standardize 404 not found handling
    return <h2>404 Not Found</h2>;
  }

  return <InnerStepper match={match} updateLocation={updateLocation} {...props} />;
};

export default HorizontalLinearStepper;
