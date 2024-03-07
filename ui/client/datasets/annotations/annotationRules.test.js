/* eslint-disable no-undef */
import {
  previousPrimaryColumn, verifyQualifierPrimaryRules,
  verifyConditionalRequiredFields, knownFieldAnnotations
} from './annotationRules';

describe('verifyQualifierPrimaryRules', () => {
  test('Cant qualify other qualifier columns', () => {
    const currentColumnValues = {
      isQualifies: true,
      qualifies: ['longitude', 'other']
    };

    const allColumnValues = {
      longitude: {
        isQualifies: true
      },
      other: {
        isQualifies: true
      },
      andAnother: {
        isQualifies: false
      }
    };

    const result = verifyQualifierPrimaryRules(currentColumnValues, allColumnValues);

    expect(result).toEqual({ isQualifies: ["Cannot qualify qualifier column(s): 'longitude', 'other'."] });
  });

  test('Can\'t qualify primary columns', () => {
    const currentColumnValues = {
      isQualifies: true,
      qualifies: ['latitude', 'other']
    };

    const allColumnValues = {
      latitude: {
        primary: true
      },
      other: {
      },
      andAnother: {
      }
    };

    const result = verifyQualifierPrimaryRules(currentColumnValues, allColumnValues);

    expect(result)
      .toEqual({ isQualifies: ["Cannot qualify primary column(s): 'latitude'."] });
  });

  test('Can\'t specificy qualifies checkbox without selecting columns to qualify', () => {
    const currentColumnValues = {
      isQualifies: true,
      qualifies: []
    };

    const allColumnValues = {};

    const result = verifyQualifierPrimaryRules(currentColumnValues, allColumnValues);

    expect(result)
      .toEqual({ isQualifies: ['Please select at least one column to qualify.'] });
  });

  test('Can\'t mark a primary column as a qualifier', () => {
    const currentColumnValues = {
      isQualifies: true,
      primary: true,
      qualifies: ['some-such']
    };

    const allColumnValues = {};

    const result = verifyQualifierPrimaryRules(currentColumnValues, allColumnValues);

    expect(result)
      .toEqual({ primary: ['A primary column cannot be marked as a qualifier.'] });
  });
});

describe('previousPrimaryColumn', () => {
  test('correctly finds an existing primary column and returns its columnFieldName', () => {
    const allAnnotations = {
      anotherColumnField: {
        category: 'jabberwocky',
        primary: true
      }
    };

    const editingValues = {
      category: 'jabberwocky',
      primary: true
    };

    const editingColumnName = 'value';

    const result = previousPrimaryColumn(allAnnotations, editingValues, editingColumnName);

    expect(result).toBe('anotherColumnField');
  });

  test('if it finds an existing primary column but its the same editing column, does not return a match', () => {
    const allAnnotations = {
      value: {
        category: 'DiddleDiddle',
        primary: true
      }
    };

    const editingValues = {
      category: 'DiddleDiddle',
      primary: true
    };

    const editingColumnName = 'value';

    const result = previousPrimaryColumn(allAnnotations, editingValues, editingColumnName);

    expect(result).toBeNull();
  });

  test('no previous primary with same category found', () => {
    const allAnnotations = {
      AnotherColumnField: {
        category: 'Panjadrum',
        primary: true
      }
    };

    const editingValues = {
      category: 'Geraniums',
      primary: true
    };

    const editingColumnName = 'value';

    const result = previousPrimaryColumn(allAnnotations, editingValues, editingColumnName);

    expect(result).toBeNull();
  });
});

describe('verifyConditionalRequiredFields', () => {
  test('Epoch date type doesn\' require a time_format', () => {
    const currentColumnValues = {
      category: 'time',
      date_type: 'epoch',
      description: 'hello'
    };

    const result = verifyConditionalRequiredFields(currentColumnValues);

    expect(result).toEqual({});
  });

  test('selecting 3 fields on a build-a-geo annotation yields no errors', () => {
    const annotation = {
      description: 'some description',
      category: 'geo',
      geo_type: 'country',
      'geo.multi-column': true,
      primary: true,
        'geo.multi-column.admin0': 'countryCol',
        'geo.multi-column.admin1': 'admin1Field',
        'geo.multi-column.admin1': 'admin2Item',
    };

    const out = verifyConditionalRequiredFields(annotation);

    expect(out).toEqual({})
  });

  test('selecting 1 field on a build-a-geo annotation yields errors, as this isnt multipart', () => {

    const annotation = {
      description: 'some description',
      category: 'geo',
      geo_type: 'admin1',
      primary: true,
      'geo.multi-column': true,
      'geo.multi-column.admin1': 'admin1Field',
    };

    const out = verifyConditionalRequiredFields(annotation);
    expect(out).toEqual({'geo.multi-column': 'Select at least two columns for a build-a-geo annotation.'});
    
  });


  test('selecting 1 field on a build-a-geo annotation, but removing the build-a-geo checkbox, yields no errors', () => {

    const annotation = {
      description: 'some description',
      category: 'geo',
      geo_type: 'admin1',
      primary: true,
      'geo.multi-column': false,
      'geo.multi-column.admin1': 'admin1Field',
    };

    const out = verifyConditionalRequiredFields(annotation);
    expect(out).toEqual({});
    
  });

});

describe('knownFieldAnnotations', () => {
  test('removes top-level base annotations that arent related to dataset fields', () => {
    const annotations = {
      geo: [{
        name: 'country',
        display_name: '',
        description: 'all_gadm_levels',
        type: 'geo',
        geo_type: 'country',
        primary_geo: true,
        resolve_to_gadm: null,
        is_geo_pair: null,
        coord_format: null,
        qualifies: null,
        aliases: {},
        gadm_level: 'admin0'
      }, {
        name: 'admin1',
        display_name: '',
        description: 'all_gadm_levels',
        type: 'geo',
        geo_type: 'state/territory',
        primary_geo: true,
        resolve_to_gadm: null,
        is_geo_pair: null,
        coord_format: null,
        qualifies: null,
        aliases: {},
        gadm_level: 'admin1'
      }]
    };

    const columns = [{ field: 'country' }];

    const output = knownFieldAnnotations(annotations, columns);

    expect(output.geo).toEqual(
      [{
        name: 'country',
        display_name: '',
        description: 'all_gadm_levels',
        type: 'geo',
        geo_type: 'country',
        primary_geo: true,
        resolve_to_gadm: null,
        is_geo_pair: null,
        coord_format: null,
        qualifies: null,
        aliases: {},
        gadm_level: 'admin0'
      }]
    );
  });

  test('if a present top-level annotaiton is of date type, and contains associated columns for non existing fields, removes those', () => {
    const columns = [{ field: 'year' }];
    const annotations = {
      date: [{
        name: 'year',
        display_name: '',
        description: 'sample date',
        type: 'date',
        date_type: 'year',
        primary_date: true,
        time_format: '%Y',
        associated_columns: {
          Month: 'month',
          Day: 'day'
        },
        qualifies: null,
        aliases: {}
      }]
    };

    const output = knownFieldAnnotations(annotations, columns);

    expect(output.date).toEqual([{
      name: 'year',
      display_name: '',
      description: 'sample date',
      type: 'date',
      date_type: 'year',
      primary_date: true,
      time_format: '%Y',
      associated_columns: null,
      qualifies: null,
      aliases: {}
    }]);
  });
});
