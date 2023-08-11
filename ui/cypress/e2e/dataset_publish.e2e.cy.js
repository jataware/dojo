
import {
  genDataset,
  dataset_acled_annotations,
  dataset_uniform_annotations,
} from '../seeds/dataset';

import { gen_tranform_intercepts } from '../support/helpers';

const genTransformPairs = (dataset_id) => {
  return [
      ['gadm_processors.resolution_alternatives', {
        id: `${dataset_id}_gadm_processors.resolution_alternatives`,
        result: {
          field: 'mockCountry',
          exact_match: [],
          fuzzy_match: [],
        }
      }],

      ['transformation_processors.restore_raw_file', {
        "message": "File not found, nothing was changed",
        "transformed":false
      }],
      ['resolution_processors.calculate_temporal_resolution', {
        "message": "Resolution calculated successfully",
        "resolution_result": {
          uniformity: 'PERFECT',
          "unit": "day",
          "resolution": 1,
          "error": 0
        }
      }],
      ['transformation_processors.get_unique_dates', {
        "message": "Unique dates list generated",
        "unique_dates": [
          2022
        ]
      }],
      ['transformation_processors.get_boundary_box', {
        "message": "Boundary box generated successfully",
        "boundary_box": {
          "xmin": -26.0423,
          "xmax": 15.3333,
          "ymin": 26.3539,
          "ymax": 57.7956
        }
      }],
      ['resolution_processors.calculate_geographical_resolution', {
        "message": "Resolution calculated successfully",
        "resolution_result": {
          "uniformity": "uniform",
          "unit": "country"
        }
      }],
      ['gadm_processors.all_gadm_values', ['mocked_countries']],
      ['transformation_processors.scale_time', {}]
  ];
};

import { waitForElwood } from '../support/helpers';


describe('Dataset Register: Publish E2E', () => {

  let dataset_id;

  afterEach(() => {
    console.log('Cleaning seeded artifacts.');
    cy.task('seed:clean', {type: 'dataset', id: dataset_id});
    cy.task('seed:clean', {type: 'annotation', id: dataset_id});

    // Call seed:clean-files for minio files? TBD.
  });

  it('From Annotate > skip transform > Process/publish modifies the dataset correctly', () => {

    const dataset = genDataset('acled');

    cy.request('POST', '/api/dojo/indicators', dataset)
      .then(({body}) => {

        const createdDataset = body
        dataset_id = createdDataset.id;
        const transformPairs = genTransformPairs(dataset_id);

        cy.request('POST', `/api/dojo/indicators/${dataset_id}/annotations`, dataset_acled_annotations);
        cy.task('upload', {type: 'dataset', id: dataset_id, variant: 'acled'});

        // Stub transform fetch jobs for this one, as we only care about run_elwood results
        transformPairs.forEach((testData) => {
          const [fetch_job, start_job] = gen_tranform_intercepts.apply(null, [dataset_id, ...testData]);
          cy.intercept(fetch_job[0], fetch_job[1]).as(fetch_job[2]);
          cy.intercept(start_job[0], start_job[1]).as(start_job[2]);
        });

        cy.visit(`/datasets/register/transform/${dataset_id}?filename=raw_data.xlsx`);

        cy.
          findByRole('button', {name: /Next/i})
          .click();

        cy.wait(3000);

        cy.wrap(waitForElwood('run_elwood', dataset_id))
          .then((elwoodResult) => {

            console.log('run_elwood res:', elwoodResult);

            cy.wait(3000);

            cy.wrap(waitForElwood('scale_features', dataset_id))
              .then((scaleResult) => {

                console.log('Scale res:', scaleResult);

                // Wait, then click submit/publish.
                // 10 seconds for Ubuntu, up to 2 minutes for macos+docker
                cy.
                  findAllByRole('button', {name: /Submit To Dojo/i, timeout: 10000})
                  .eq(1)
                  .click();

                cy.wait(2000); // Allow time for the sync plugins to run.

                // Finally, fetch final dataset and assert expected properties
                cy.request(`/api/dojo/indicators/${dataset_id}`).as('FinalDataset');

                cy
                  .get('@FinalDataset')
                  .then((response) => {

                    const { body } = response;

                    expect(body.id).to.equal(dataset_id);
                    expect(body.published).to.equal(true);

                    expect(body.feature_names).to.have.length(2);
                    expect(body.outputs).to.have.length(1);
                    expect(body.qualifier_outputs).to.have.length.of.at.least(1);
                    expect(body.geography.country).to.have.length.of.at.least(1);

                    expect(body.period).to.have.property('gte');
                    expect(body.period).to.have.property('lte');
                  });

              });

          });

      });

  });

});
