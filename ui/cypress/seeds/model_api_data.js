
const { faker } = require('@faker-js/faker');

const genMaintainer = () => ({
    "name": faker.person.fullName(),
    "email": faker.internet.email(),
    "organization": faker.person.zodiacSign(),
    "website": `${faker.color.human()}-${faker.person.middleName()}.com`
});

const genOutputFile = (modelId, modelName) => {
  const uuid = faker.string.uuid();
  return {
    "id": uuid,
    "model_id": modelId,
    "name": modelName,
    "output_directory": "/home/clouseau/test-model/output",
    "path": "output*.csv",
    "file_type": "csv",
    "transform": {
      "feature": [
        {
          "aliases": {},
          "type" :"feature",
          "description": faker.commerce.productDescription(),
          "display_name": "value",
          "qualifies": [],
          "feature_type": "float",
          "units_description": "",
          "units": "count",
          "name": "value"
        }
      ],
      "geo": [
        {
          "aliases": {},
          "type": "geo",
          "description": faker.commerce.productDescription(),
          "display_name": "latitude",
          "qualifies": [],
          "geo_type": "longitude",
          "resolve_to_gadm": false,
          "coord_format": "lonlat",
          "name": "longitude",
          "primary_geo": true,
          "gadm_level": "admin2"
        },
        {
          "aliases": {},
          "type": "geo",
          "description": "latitude location",
          "display_name": "latitude",
          "qualifies": [],
          "geo_type": "latitude",
          "resolve_to_gadm" : false,
          "coord_format": "lonlat",
          "name": "latitude",
          "primary_geo": true,
          "gadm_level": "admin2",
          "is_geo_pair": "longitude"
        }
      ],
      "date": [
        {
          "aliases": {},
          "type": "date",
          "description": "dwd",
          "display_name": "date",
          "qualifies": [],
          "qualifierrole": "breakdown",
          "date_type": "date",
          "time_format": "%Y-%m-%d",
          "name": "date",
          "primary_date": true
        }
      ],
      "meta": {
        "ftype": "csv"
      }
    },
    "prev_id": "5ac502ec-bc54-45bf-b3da-61ede16c7067"
  };
};

const genOutput = () => (
  {
    name: faker.commerce.product(),
    display_name: faker.commerce.productName(),
    "description": faker.commerce.productDescription(),
    "type": "float",
    "unit": "count",
    "unit_description": "number of items",
    "is_primary": false,
    "additional_options": null,
    "data_resolution": {
      "temporal_resolution": faker.helpers.arrayElement(['annual', 'monthly', 'daily']),
      "spatial_resolution": null
    },
    "choices": null,
    "min": null,
    "max": null,
    "alias": {},
    // outputfileId=
    "uuid": faker.string.uuid(),
    "ontologies": null
  }
  );

const genQualifierOutput = () => ({
  "name": faker.commerce.product(),
  "display_name": faker.commerce.productName(),
  "description": faker.commerce.productDescription(),
  "type": faker.helpers.arrayElement(['int', 'float', 'str', 'boolean', 'datetime', 'lat', 'lng', 'country', 'admin1', 'admin2', 'admin3']),
  "unit": "",
  "unit_description": "",
  "related_features": [
    "value"
  ]
});

const generatedIDs = [];

const genBaseModel = (id) => {
  const uuid = id || faker.string.uuid();

  generatedIDs.push(uuid);

  // console.log('faker', faker);

  return {
    id: uuid,
    name: `Seed-${faker.person.firstName()}`,
    family_name: faker.music.genre(),

    description: faker.commerce.productDescription(),

    "created_at": +(faker.date.past()),

    "category": faker.helpers.arrayElements(['Logic', 'Mathematics', 'Physics', 'Chemistry']),

    domains: faker.helpers.arrayElements(['Logic', 'Mathematics', 'Physics', 'Chemistry']),

    maintainer: genMaintainer(),
    image: `jataware/dojo-test:76be3029-e224-4db9-a333-b54f41e23ce3`,

    observed_data: [
      "string"
    ],

    is_stochastic: false,
    outputs: faker.helpers.multiple(genOutput, { count: 2 }),

    "qualifier_outputs": faker.helpers.multiple(genQualifierOutput, { count: 2}),

    "tags": faker.helpers.multiple(faker.company.catchPhraseNoun),

    "geography": {
      "coordinates": [],
      "country": faker.helpers.multiple(faker.location.country),

      // State/Territory=
      "admin1": faker.helpers.multiple(faker.location.state),

      // County/District=
      "admin2": faker.helpers.multiple(faker.location.county),

      // Municipality/Town=
      "admin3": faker.helpers.multiple(faker.location.street)
    },
    "period": {
      "gte": 0,
      "lte": 10000000000
    },
    // "next_version": "string", // would mean the current version is deprecated in favor of next version
    // "prev_version": "string",
    "is_published": true,
    "commit_message": faker.company.catchPhrase()
  };
 };

/**
 *
 **/
const genConfig = (modelId) => {
  return [{
    "model_config": {
      "model_id": modelId,
      "path":"/home/clouseau/test-model/configFiles/parameters.json",
      "parameters":[
        {"start":13,"end":16,"text":"0.9","annotation": {
          "name": "rainfall",
          "description": "eldnef",
          "type": "int",
          "default_value": "0.9",
          "unit": "",
          "unit_description": "",
          "data_type": "numerical",
          "predefined": false,
          "options":[],
          "min":"",
          "max":""
        }}
      ],
      "md5_hash":"c982ef4fdc0ebb2fb43a9b86d23d0b7d",
      "id":"17ebc618-9087-4e29-b6a7-5c6d36e8c6f2"
    },
    file_content: '{"rain": "1.4"}'
  }];
};

/**
 *
 **/
const genDirective = (modelId) => {

  return {
    "model_id": modelId,
    "command":"python3 main.py --temp 1.3",
    "cwd":"/home/terminal/test-model",
    "parameters":[
      {"start":0,
       "end":0,
       "text":"string",
       "annotation": {
         "name":"string",
         "description": "string",
         "type": "int",
         "default_value": "string",
         "unit": "string",
         "unit_description": "string",
         "data_type": "nominal",
         "predefined": false,
         "options": ["string"],
         "min": "string",
         "max": "string"
       }}
    ],
    "id":"61036b02-04c0-4ab5-a550-26abecb23617"
  };

};


module.exports = { genBaseModel, generatedIDs, genConfig, genDirective };

// export genBaseModel;
