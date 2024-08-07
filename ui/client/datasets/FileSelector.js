import React, { useState } from 'react';
import { useField } from 'formik';
import * as XLSX from 'xlsx/xlsx.mjs';
import * as GeoTiff from 'geotiff';

import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import isEmpty from 'lodash/isEmpty';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import { makeStyles } from 'tss-react/mui';

import { matchFileNameExtension } from '../utils';
import { getBrandName } from '../components/uiComponents/Branding';

const useStyles = makeStyles()((theme) => ({
  root: {
    margin: `${theme.spacing(1)} 0`,
    '& .MuiFormHelperText-root': {
      marginLeft: 7,
      marginRight: 5,
    }
  },
  warning: {
    backgroundColor: 'pink'
  },
  uploadedFileData: {
    padding: `${theme.spacing(1)} ${theme.spacing(0)}`,
    '& .filename': {
      fontWeight: 'bold'
    },
    '& button': {
      marginTop: theme.spacing(0.5)
    }
  },
  geotiffInputWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: '0.5em',
    rowGap: '1em',
    marginTop: '1em',
    marginBottom: '1em'
  },
}));

const GeotiffTextField = ({
  name, label, placeholder, onChange, ...props
}) => (
  <TextField
    name={name}
    variant="outlined"
    label={label}
    placeholder={placeholder}
    onChange={onChange}
    required
    fullWidth
    InputProps={{
      style: { borderRadius: 0 },
    }}
    InputLabelProps={{ shrink: true }}
    {...props}
  />
);

const NullGeotiffTooltip = ({ ...props }) => (
  <Tooltip
    title={(
      <Typography variant="caption">
        Numeric value that when used indicates missing or null values.<br />
        Geotiff values are always an integer or float.
      </Typography>
  )}
    {...props}
  />
);

export const ExtraInput = ({
  fileMetadata, setFileMetadata
}) => {
  // TODO This metadata is set on user file select etc, not on loading a previously
  // uploaded file. We'll check if we can populate
  // and display these prepopulated instead....
  // console.log('FileSelector.js - ExtraInput - fileMetadata:', fileMetadata);
  const { classes } = useStyles();

  if (!fileMetadata.filetype) {
    if (!fileMetadata.file_uuid) {
      // the metadata hasn't loaded, so show a spinner until it loads
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'grey.600',
            marginTop: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>Loading File Type...</Typography>
          <CircularProgress size={24} color="inherit" />
        </Box>
      );
    }

    // the metadata has loaded and we still don't have the filetype, so nothing to show
    return null;
  }

  const setBand = (evt, band_num) => {
    const { value } = evt.target;
    const geotiff_bands = { ...(fileMetadata.geotiff_bands) };
    if (value === '') {
      if (geotiff_bands.hasOwnProperty(band_num)) {
        delete geotiff_bands[band_num];
      } else {
        return;
      }
    } else {
      geotiff_bands[band_num] = value;
    }
    setFileMetadata({ ...fileMetadata, geotiff_bands });
  };

  // TODO: Include this in the formik form (or make a new form?) so it can have errors
  // and be required etc - currently problematic for ModelOutput with how it saves to formik.values
  // instead of metadata

  // Don't include the onChange prop if we have the formikControlled prop
  // or formik's onChange prop will get overwritten in FormikAwareTextField
  // const conditionalOnChange = (handler) => (
  //   formikControlled ? {} : {
  //     onChange: (event) => {
  //       handler(event);
  //     }
  //   }
  // );

  if (fileMetadata.filetype === 'excel') {
    const label = 'Sheet selection';
    const name = 'excel_sheet';

    return (
      <Autocomplete
        name={name}
        value={fileMetadata.excel_sheet}
        autoHighlight
        options={fileMetadata.excel_sheets}
        onChange={(evt, value) => {
          if (value) {
            setFileMetadata({ ...fileMetadata, excel_sheet: value });
          }
        }}
        onBeforeInput={(evt) => {
          if (evt.nativeEvent?.type === 'keypress' && evt.nativeEvent.keyCode === 13) {
            evt.preventDefault();
            evt.stopPropagation();
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label={label}
          />
        )}
      />
    );
  }
  if (fileMetadata.filetype === 'geotiff') {
    if (fileMetadata.geotiff_band_count > 1) {
      return (
        <>
          <div style={{
            marginBottom: '1em',
            marginTop: '1em',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            alignItems: 'center',
          }}
          >
            <Typography
              display="inline"
            >
              The dimensions of my geotiff bands repesent:
            </Typography>
            <Select
              name="band_type"
              variant="outlined"
              margin="dense"
              value={fileMetadata.geotiff_band_type}
              onChange={(event) => setFileMetadata({
                ...fileMetadata, geotiff_band_type: event.target.value, geotiff_bands: {}
              })}
            >
              <MenuItem value="category">category</MenuItem>
              <MenuItem value="temporal">temporal</MenuItem>
            </Select>
          </div>

          {fileMetadata.geotiff_band_type === 'category' && (
            <>
              <div className={classes.geotiffInputWrapper}>
                <GeotiffTextField
                  name="geotiff_value"
                  label="Dataset date"
                  placeholder="YYYY-MM-DD"
                  onChange={(event) => setFileMetadata({
                    ...fileMetadata, geotiff_value: event.target.value
                  })}
                />
                <NullGeotiffTooltip>
                  <span>
                    <GeotiffTextField
                      name="geotiff_Null_Val"
                      label="Geotiff Null Value"
                      onChange={(event) => setFileMetadata({
                        ...fileMetadata, geotiff_null_value: event.target.value
                      })}
                    />
                  </span>
                </NullGeotiffTooltip>
              </div>

              <div className={classes.geotiffInputWrapper}>
                {/* generate numbered TextField input for each band in the geotiff for labeling */}
                {Array.from(Array(fileMetadata.geotiff_band_count).keys())
                  .map((i) => {
                    const band_num = i + 1;
                    return (
                      <GeotiffTextField
                        key={`band_${band_num}`}
                        name="bands"
                        label={`Band ${band_num} Name`}
                        onChange={(evt) => setBand(evt, band_num)}
                      />
                    );
                  })}
              </div>
            </>
          )}
          {fileMetadata.geotiff_band_type === 'temporal' && (
          <>
            <div className={classes.geotiffInputWrapper}>
              <GeotiffTextField
                name="geotiff_feature_name"
                label="Enter feature name"
                onChange={(event) => setFileMetadata({
                  ...fileMetadata, geotiff_value: event.target.value
                })}
              />
              <NullGeotiffTooltip>
                <GeotiffTextField
                  name="geotiff_Null_Val"
                  label="Geotiff Null Value"
                  onChange={(event) => setFileMetadata({
                    ...fileMetadata, geotiff_null_value: event.target.value
                  })}
                />
              </NullGeotiffTooltip>
            </div>

            <div>
              <Typography variant="caption">Suggested format: YYYY-MM-DD</Typography>
            </div>
            <div className={classes.geotiffInputWrapper}>
              {/* generate numbered TextField input for each band in the geotiff for labeling */}
              {Array.from(Array(fileMetadata.geotiff_band_count).keys()).map((i) => {
                const band_num = i + 1;
                return (
                  <GeotiffTextField
                    key={`band_${band_num}`}
                    bandnum={band_num}
                    name="bands"
                    label={`Band ${band_num} Date`}
                    onChange={(evt) => setBand(evt, band_num)}
                  />
                );
              })}
            </div>
          </>
          )}
        </>
      );
    }
    if (fileMetadata.geotiff_band_count === 1) {
      return (
        <div className={classes.geotiffInputWrapper}>
          <GeotiffTextField
            name="geotiff_Feature_Name"
            label="Geotiff Feature Name"
            onChange={
              (event) => setFileMetadata({ ...fileMetadata, geotiff_value: event.target.value })
            }
          />
          <NullGeotiffTooltip>
            <span>
              <GeotiffTextField
                name="geotiff_Null_Val"
                label="Geotiff Null Value"
                onChange={
                  (event) => setFileMetadata({
                    ...fileMetadata, geotiff_null_value: event.target.value
                  })
                }
              />
            </span>
          </NullGeotiffTooltip>
          <GeotiffTextField
            name="geotiff_date_value"
            label="Enter dataset date"
            placeholder="YYYY-MM-DD"
            onChange={
              (event) => setFileMetadata({
                ...fileMetadata, geotiff_date_value: event.target.value
              })
            }
          />
        </div>
      );
    }

    return <div>File can&apos;t be read correctly!!</div>;
  }
  return null;
};

/**
 *
 * */
export const FileInput = ({
  formik, datasetInfo, setDatasetInfo, fileMetadata, setFileMetadata,
  name, label, onFileSelect, InputProps = {}, required, requiredFn,
  inputProps = {}, ...props
}) => {
  const [{ onChange, value, ...field }, meta] = useField({ ...props, name });

  const { classes } = useStyles();

  function handleChange(event) {
    // Set value in form context
    onChange(event);

    // handle further logic from caller
    if (onFileSelect) {
      onFileSelect(event);
    }
  }

  return (
    <TextField
      className={classes.root}
      label={label}
      variant="outlined"
      fullWidth
      InputLabelProps={{ shrink: true }}
      InputProps={{
        type: 'file',
        style: { borderRadius: 0 },
        ...InputProps
      }}
      inputProps={{
        'data-testid': 'file-upload-input',
        'aria-label': label,
        ...inputProps
      }}
      {...field}
      helperText={get(meta, 'touched') && get(meta, 'error')}
      error={get(meta, 'error') && get(meta, 'touched')}
      required={required || (isFunction(requiredFn) ? requiredFn(name) : false)}
      onChange={handleChange}
      {...props}
    />
  );
};

/**
 *
 * */
export const FileSelector = ((allProps) => {
  const {
    formik,
    fileMetadata, setFileMetadata,
    isUpdatingUploadedFile, setUpdatingUploadedFile,
    displayUploadedFile,
    uploadedFilesData,
    ...props
  } = allProps;

  const { classes } = useStyles();
  const brandName = getBrandName();

  const [message, setMessage] = useState(null);

  const analyzeExcel = (file, metadata) => {
    setMessage(null);
    const reader = new FileReader();

    reader.onload = () => {
      const xlsxFile = XLSX.read(reader.result);
      const excel_sheets = xlsxFile.SheetNames;
      setFileMetadata({
        ...metadata,
        filetype: 'excel',
        excel_sheets,
        excel_sheet: excel_sheets[0],
      });
    };

    reader.readAsArrayBuffer(file);
  };

  const analyzeGeotiff = (file, metadata) => {
    const reader = new FileReader();

    reader.onload = () => {
      GeoTiff.fromArrayBuffer(reader.result).then((geotiffFile) => {
        geotiffFile.getImage().then((image) => {
          const band_count = image.getSamplesPerPixel();
          setFileMetadata({
            ...metadata,
            filetype: 'geotiff',
            geotiff_band_count: band_count,
            ...(
              (band_count > 1)
                ? {
                  geotiff_band_type: 'category',
                  geotiff_bands: {},
                } : {}
            )
          });
        });
      });
    };

    reader.readAsArrayBuffer(file);
  };

  const extensionHandlers = {
    '.tif': [analyzeGeotiff, 'geotiff'],
    '.tiff': [analyzeGeotiff, 'geotiff'],
    '.xlsx': [analyzeExcel, 'excel'],
    '.xls': [analyzeExcel, 'excel'],
    '.csv': [null, 'csv'],
    '.nc': [null, 'netcdf'],
    '.cdf': [null, 'netcdf'],
  };

  const analyzeFile = (evt) => {
    setMessage(null);
    const fileInput = evt.target;
    const file = fileInput.files[0];
    const filename = file.name.toLowerCase();
    const fileExtensionMatch = matchFileNameExtension(filename);

    if (fileExtensionMatch) {
      const [extensionHandler, filetypeValue] = extensionHandlers[fileExtensionMatch];
      const rawFileName = `raw_data${fileExtensionMatch}`;

      // Important- filename and rawFileName set on metadata here
      const metadata = { filetype: filetypeValue, filename, rawFileName };

      return extensionHandler
        ? extensionHandler(file, metadata)
        : setFileMetadata({ ...fileMetadata, ...metadata });
    }

    setMessage(`File ${file.name} is not a type that ${brandName} is able to process.`);
    setFileMetadata({});

    return null;
  };

  const uploadedRawFileNameToUse = get(props?.datasetInfo, 'fileData.raw.rawFileName');
  const uploadedFileName = get(props?.datasetInfo, 'fileData.raw.url');
  const uploadedFileMetadata = get(uploadedFilesData, uploadedRawFileNameToUse, null);

  const fileMetadataKeys = uploadedFileMetadata
    ? Object
      .keys(uploadedFileMetadata)
      .filter((k) => !['filename', 'excel_sheets', 'rawFileName', 'filetype'].includes(k)) : [];

  return (
    <div>
      {displayUploadedFile && !isUpdatingUploadedFile ? (
        <div className={classes.uploadedFileData}>
          <Typography>
            Uploaded filename:
            <span className="filename">
              {uploadedFileName}
            </span>
          </Typography>

          <table>
            <tbody>
              {fileMetadataKeys.map((key) => (
                <tr key={key}>
                  <td>
                    {key}
                  </td>
                  <td>
                    {uploadedFileMetadata[key]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {setUpdatingUploadedFile && (
            <Button
              variant="outlined"
              size="small"
              color="grey"
              onClick={() => setUpdatingUploadedFile(true)}
            >
              Replace File

            </Button>
          )}
        </div>
      ) : (
        <>
          <FileInput
            onFileSelect={analyzeFile}
            {...props}
          />
          {displayUploadedFile && (
            <div className={classes.uploadedFileData}>
              <Typography>You&apos;re replacing a previously uploaded file.</Typography>
              <Button
                variant="outlined"
                size="small"
                color="grey"
                onClick={() => setUpdatingUploadedFile(false)}
              >
                Cancel and use original
              </Button>
            </div>
          )}
        </>
      )}
      {message && (
        <div className={message ? classes.warning : ''}>
          {message}
        </div>
      )}
      {/* only load ExtraInput after the file upload has started (in Register.js) */}
      {!isEmpty(fileMetadata) && (
        <ExtraInput
          formik={formik}
          fileMetadata={fileMetadata}
          setFileMetadata={setFileMetadata}
        />
      )}
    </div>
  );
});
