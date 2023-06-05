/* eslint-disable no-undef */
import { formatFileUploadValidationError } from './Annotate';

describe('formatfileuploadvalidationerror', () => {
  test('given json with multiple aspects of error fields, returns a sentence that properly describes field in error and its provided value', () => {
    const input = [
      {
        loc: [
          'data_type'
        ],
        msg: 'field required',
        type: 'value_error.missing',
        input_value: {
          field_name: 'region',
          group: '',
          display_name: 'General Region',
          description: 'general region of main_geo',
          data_type: '',
          units: 'na',
          units_description: '',
          primary: '',
          date_format: '',
          gadm_level: '',
          resolve_to_gadm: '',
          coord_format: '',
          qualifies: '',
          qualifier_role: 'breakdown'
        },
        message: '1 validation error for RequiredField\ndata_type\n  field required (type=value_error.missing)'
      }
    ];

    const output = formatFileUploadValidationError(input);

    expect(output).toBe('A validation error has occured on the file provided: The field `region` has no valid `data_type` value. Value provided: ``.');
  });
});
