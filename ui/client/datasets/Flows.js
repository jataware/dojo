import axios from 'axios';
import Register from './Register';
import Annotate from './Annotate';
import Append from './Append';
import DataTransformation from './DataTransformation/DataTransformation';
import UpdateMetadata from './UpdateMetadata';
import ModelOutput from './ModelOutput';
import Preview from './Preview';
import SubmitSuccessPage from './SubmitSuccessPage';
import RunJobs from './RunJobs';

const updateFlowDisabledFields = [
  'feature_type', 'geo_type',
  'coord_format', 'primary',
  'resolve_to_gadm', 'geo.coordinate-pair',
  'geo.coordinate-pair-column', 'geo.multi-column',
  'gadm_level', 'date_type',
  'date.multi-column', 'time_format',
  'category', 'isQualifies',
  'qualifies',
  // 'qualifierrole',
  'aliases', 'display_name'
];

// This config is much more flexible than to disable fields,
// but for now we only need it for this purpose
const updateFlowFieldsConfig = updateFlowDisabledFields
  .reduce((acc, currentKey) => {
    acc[currentKey] = { disabled: true };
    return acc;
  }, {});
updateFlowFieldsConfig.CLEAR_BUTTON_JATAWARE_INTERNAL = { disabled: true };

const BasicRegistrationFlow = {
  steps: [
    {
      slug: 'register',
      title: 'Dataset Registration',
      label: 'Registration',
      component: Register,
      options: {}
    },
    // {
    //   slug: 'scan',
    //   title: 'Anomaly Detection',
    //   label: 'Scan',
    //   component: AnomalyDetection,
    //   options: {
    //     jobs: [{id: 'tasks.anomaly_detection',}]
    //   },
    // },
    {
      slug: 'analyze',
      title: 'Analyzing Dataset',
      label: 'Analysis',
      component: RunJobs,
      options: {
        jobs: [
          {
            id: 'file_processors.file_conversion',
          },
          {
            id: 'geotime_processors.geotime_classify',
          },
        ]
      }
    },
    {
      slug: 'annotate',
      title: 'Annotate Dataset',
      label: 'Annotation',
      component: Annotate,
      options: {}
    },
    {
      slug: 'transform',
      title: 'Transform & Manage Data',
      label: 'Transformation',
      component: DataTransformation,
      options: {}
    },
    {
      slug: 'process',
      title: 'Processing Dataset',
      label: 'Processing',
      component: RunJobs,
      options: {
        jobs: [
          {
            id: 'elwood_processors.run_elwood',
            send_context: true,
            handler: async ({
              result, datasetInfo, setDatasetInfo
            }) => {
              const updatedDataset = {
                ...datasetInfo,
                data_paths: result.data_files,
                geography: result.geography,
                period: result.period,
                outputs: result.outputs,
                qualifier_outputs: result.qualifier_outputs,
                temporal_resolution: result.temporal_resolution,
                spatial_resolution: result.spatial_resolution
              };
              setDatasetInfo(updatedDataset);
              await axios.put('/api/dojo/indicators', updatedDataset);
            }
          },
          {
            id: 'elwood_processors.scale_features',
            send_context: true,
            handler: async ({
              result, datasetInfo, setDatasetInfo
            }) => {
              const updatedDataset = {
                ...datasetInfo,
                ...result,
              };
              setDatasetInfo(updatedDataset);
              await axios.put('/api/dojo/indicators', updatedDataset);
            }
          },
        ]
      }
    },
    {
      slug: 'preview',
      title: 'Preview Dataset',
      label: 'Preview',
      component: Preview,
      options: {
        handleNextFunc: 'PublishDataset',
      }
    },
    {
      slug: 'submit',
      title: 'Submit Dataset',
      label: 'Submit',
      component: SubmitSuccessPage,
      options: {}
    },
  ]
};

const ModelOutputFlow = {
  steps: [
    {
      slug: 'model',
      title: 'Model Output Registration',
      label: 'Registration',
      component: ModelOutput,
      options: {}
    },
    {
      slug: 'analyze',
      title: 'Analyzing Dataset',
      label: 'Analysis',
      component: RunJobs,
      options: {
        jobs: [
          {
            id: 'file_processors.model_output_preview',
            send_context: true,
            handler: ({ result, setRawFileName }) => {
              setRawFileName(result);
            }
          },
          {
            id: 'geotime_processors.model_output_geotime_classify',
            send_context: true,
            handler: ({
              result, annotations, setAnnotations,
            }) => {
              // eslint-disable-next-line no-param-reassign
              annotations.metadata.geotime_classify = result;
              setAnnotations(annotations);
            }
          },
        ],
      }
    },
    {
      slug: 'annotate',
      title: 'Annotate Dataset',
      label: 'Annotation',
      component: Annotate,
      options: {
        useFilepath: true,
        onSubmit: ({
          annotations, formattedAnnotations, setAnnotations, handleNext
        }) => {
          // eslint-disable-next-line no-param-reassign
          annotations.annotations = formattedAnnotations;
          setAnnotations(annotations);
          handleNext();
        }
      }
    },
    {
      slug: 'process',
      title: 'Processing Dataset',
      label: 'Processing',
      component: RunJobs,
      options: {
        jobs: [
          {
            id: 'elwood_processors.run_model_elwood',
            send_context: true,
            handler: async ({
              result, annotations, setAnnotations
            }) => {
              // eslint-disable-next-line no-param-reassign
              annotations.metadata.mixmasterAnnotations = result.mixmaster_annotations;
              setAnnotations(annotations);
            }
          }
        ]
      }
    },
    {
      slug: 'preview',
      title: 'Preview Dataset',
      label: 'Preview',
      component: Preview,
      options: {
        useFilepath: true,
        handleNextFunc: 'PublishModelOutput',
      }
    },
    {
      slug: 'submit',
      title: 'Submit Dataset',
      label: 'Submit',
      component: SubmitSuccessPage,
      options: {}
    },

  ]
};

const AppendFlow = {
  steps: [
    {
      slug: 'upload',
      title: 'Dataset Append',
      label: 'File Upload',
      component: Append,
      options: {}
    },
    {
      slug: 'analyze',
      title: 'Analyzing Dataset',
      label: 'Analysis',
      component: RunJobs,
      options: {
        jobs: [
          {
            id: 'file_processors.file_conversion'
          },
          {
            id: 'elwood_processors.run_elwood',
            handler: async ({
              result, datasetInfo, setDatasetInfo
            }) => {
              const updatedDataset = {
                ...datasetInfo,
                data_paths: Array.concat(datasetInfo.data_paths, result.data_files),
                geography: result.geography,
                period: result.period,
              };
              setDatasetInfo(updatedDataset);
              await axios.put('/api/dojo/indicators', updatedDataset);
            }
          },
          {
            id: 'elwood_processors.scale_features',
            send_context: true,
            handler: async ({
              result, datasetInfo, setDatasetInfo
            }) => {
              const updatedDataset = {
                ...datasetInfo,
                ...result,
              };
              setDatasetInfo(updatedDataset);
              await axios.put('/api/dojo/indicators', updatedDataset);
            }
          },
        ]
      }
    },
    {
      slug: 'preview',
      title: 'Preview Dataset',
      label: 'Preview',
      component: Preview,
      options: {
        handleNextFunc: 'PublishDataset',
      }
    },
    {
      slug: 'submit',
      title: 'Submit Dataset',
      label: 'Submit',
      component: SubmitSuccessPage,
      options: {}
    },
  ]
};

const UpdateMetadataFlow = {
  steps: [
    {
      slug: 'register',
      title: 'Update Dataset Metadata',
      label: 'Registration',
      component: UpdateMetadata,
      options: {}
    },
    {
      slug: 'annotate',
      title: 'Annotate Dataset',
      label: 'Annotation',
      component: Annotate,
      options: {
        fieldsConfig: (name) => updateFlowFieldsConfig[name] || {},
        addingAnnotationsAllowed: false
      }
    },
    {
      slug: 'preview',
      title: 'Preview Dataset',
      label: 'Preview',
      component: Preview,
      options: {
        handleNextFunc: 'PublishDataset',
      }
    },
    {
      slug: 'submit',
      title: 'Submit Dataset',
      label: 'Submit',
      component: SubmitSuccessPage,
      options: {}
    },
  ]
};

const flows = {
  register: BasicRegistrationFlow,
  model: ModelOutputFlow,
  append: AppendFlow,
  update: UpdateMetadataFlow,
  // TODO replace: ReplaceDatasetFlow
};

export default flows;
