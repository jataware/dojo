// const { faker } = require('@faker-js/faker'); // if needed

/**
 * Plan/state needed for these tests:
 * 1. Need to upload a file to S3/minio.
 * 2. Need to add a pointer to it into data_paths in minio, which includes:
 *   a. The parent folder
 *   b. The raw_data.original_ext
 *   c. The raw_data.csv
 *   d. the parquet file <= only after run_elwood/transformations
 *
 * Annotations/metadata need to match to those correct files ^ filename, etc
 * Dataset and annotation objects properly constructed
 **/

/*
  More concrete plan:
  1. Create a seed dataset seed
  1.b Note down the newly created dataset ID for the seed
  2. Create annotations with same ID
  3. Upload file(s) for said dataset, update all metadata to match files/id

  4. Once all preconditions for a specific dataset register step are met,
  visit the path for that step for dataset registration
  (say the annotate, transform, preview steps, etc)
  5. perform cypress UI actions (clicks, type), and assertions
  */



///////////////////////////////////////////////////////////////////////////////
//                           pre-normalized                                  //
///////////////////////////////////////////////////////////////////////////////

const genDataset = (variant) => {
  return {
    "name": `Seed: ${variant} Dataset`,
    "family_name": null,
    "description": "hello",
    // "created_at": 1690989601903, // NOTE ignore
    "category": null,
    "domains": [
      "Logic"
    ],
    "maintainer": {
      "name": "Joel",
      "email": "joel@jataware.com",
      "organization": "",
      "website": ""
    },
    "data_paths": [],
    "outputs": [],
    "qualifier_outputs": null,
    "tags": [],
    "geography": null,
    "period": null,
    "deprecated": false,
    "data_sensitivity": "",
    "data_quality": "",
    "published": false,
    "temporal_resolution": "annual",

    // NOTE Missing fileData as it comes back and forth depending on
    //      the UI page we're in or if we're reloading the page.
    //      See https://github.com/jataware/dojo/issues/145

    "fileData" : {
      "raw" : {
        "uploaded" : true,
        "url" : "ACLED_redacted.xlsx",
        "rawFileName" : "raw_data.xlsx"
      }
    },

  };
}

const dataset_acled_before_normalized = genDataset('acled');

const dataset_acled_annotations = {
  "metadata" : {
    "transformations" : null,
    "files" : {
      "raw_data.xlsx" : {
        "excel_sheet" : "Sheet1",
        "filetype" : "excel",
        "filename" : "ACLED_redacted.xlsx",
        "rawFileName" : "raw_data.xlsx",
        "excel_sheets" : [
          "Sheet1"
        ]
      }
    },
    "histograms" : {
      // NOTE can ignore, won't use
    },
    "geotime_classify" : {
      // NOTE can ignore, won't use
    },
    "column_statistics" : {
      // NOTE can ignore, won't use
    }
  },
  "annotations" : {
    "geo" : [
      {
        "geo_type" : "country",
        "resolve_to_gadm" : true,
        "coord_format" : null,
        "aliases" : { },
        "qualifies" : [ ],
        "name" : "country",
        "description" : "all_gadm_levels",
        "primary_geo" : true,
        "display_name" : "",
        "type" : "geo"
      }
    ],
    "date" : [
      {
        "date_type" : "year",
        "time_format" : "%Y",
        "aliases" : { },
        "primary_date" : true,
        "qualifies" : [ ],
        "name" : "year",
        "description" : "sample date",
        "display_name" : "",
        "type" : "date"
      }
    ],
    "feature" : [
      {
        "feature_type" : "int",
        "aliases" : { },
        "qualifies" : [ ],
        "units_description" : "deaths",
        "qualifierrole" : null,
        "name" : "fatalities",
        "description" : "A sample value that goes in meters",
        "units" : "body_count",
        "display_name" : "No of Deaths",
        "type" : "feature"
      },
      {
        "feature_type" : "str",
        "aliases" : { },
        "qualifies" : [
          "admin1"
        ],
        "units_description" : null,
        "qualifierrole" : "breakdown",
        "name" : "region",
        "description" : "general region of main_geo",
        "units" : "na",
        "display_name" : "General Region",
        "type" : "feature"
      }
    ]
  }
};


module.exports = {genDataset, dataset_acled_annotations};
