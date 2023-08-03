
import {
  // dataset_acled_before_normalized,
  genDataset,
  dataset_acled_annotations
} from '../seeds/dataset';

function get_tranform_intercepts(dataset_id, jobName, result) {
  const method = 'POST';
  return [[
    {
      method: method,
      url: `/api/dojo/job/fetch/*_${jobName}`
    },
    result,
    `${method}_${jobName}_fetch`
  ], [
    {
      method: method,
      url: `/api/dojo/job/*/${jobName}`
    },
    {id: `${dataset_id}_${jobName}`, result},
    `${method}_${jobName}_start`
  ]];
}


function clean_dataset(id) {
  console.log('TODO clean_dataset', id);
  // TODO
  // cy.request('DELETE', `/api/dojo/indicators/${id}`);
}

describe('Dataset Register: Publish E2E', () => {
  // this is a full Dataset after run_elwood, but before publish!
  // xit('From Preview to Publish modified the dataset correctly');

  // Stub transform fetch jobs for this one, as we only care about run_elwood results:
  // TODO first:
  // use ACLED
  it('From Annotate > skip transform > Process/publish modifies the dataset correctly', async () => {
    // TODO auto-cleanups
    // 0. Clean up any dataset/annotation/file through API as precondition


    // 1. Create dataset/annotation through API as precondition
    const dataset = genDataset('acled');

    const { body: createdDataset } = await cy.request('POST', '/api/dojo/indicators', dataset);

    console.log('createdDataset', createdDataset);

    const dataset_id = createdDataset.id;

    const transformPairs = [
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

    cy.request('POST', `/api/dojo/indicators/${dataset_id}/annotations`, dataset_acled_annotations);

    // 2. Upload raw file through API
    await cy.task('upload', {type: 'dataset', id: dataset_id, variant: 'acled'});

    cy.wait(500); // TODO remove

    // 3. stub/mock transform fetch jobs so that none are required

    // Generate pair of jobs for transform jobname,result as defined above this fn
    transformPairs.forEach((testData) => {
      const [fetch_job, start_job] = get_tranform_intercepts.apply(null, [dataset_id, ...testData]);
      cy.intercept(fetch_job[0], fetch_job[1]).as(fetch_job[2]);
      cy.intercept(start_job[0], start_job[1]).as(start_job[2]);
    });

    cy.intercept({
      method: 'POST',
      url: '/api/dojo/job/clear/mock-test-guid'
    }, 'No job found for uuid = mock-test-guid');

    //  Now we're ready. test:
    // 4. open transform step, click next to skip
    cy.visit(`/datasets/register/transform/${dataset_id}?filename=raw_data.xlsx`);

    cy.wait(1000); // TODO remove

    cy.
      findByRole('button', {name: /Next/i})
      .click();

    cy.wait(20000); // TODO remove

    // 5. wait for processing, up to preview step
    // 6. click submit/publish. wait for plugins/responses or cy.wait(time is)
    cy.
      // NOTE wait for any OS to finish processing.. takes time
      findAllByRole('button', {name: /Submit To Dojo/i, timeout: 95000}) // TODO discuss
      .eq(1)
      .click();

    cy.wait(10000); // Allow time for the sync plugins to run :-(   (woop woop)

    // ?
    // 7. Finally, fetch final dataset and assert the the expected properties are present in the dataset
    cy.request(`/api/dojo/indicators/${dataset_id}`).as('FinalDataset');

    cy
      .get('@FinalDataset')
      .should((response) => {

        console.log('status', response.status);

        const { body } = response;

        console.log('body', body);

        expect(body.id).to.equal(dataset_id);

        expect(body.published).to.equal(true);

        expect(body.feature_names).to.have.length(2);

        expect(body.qualifier_outputs).to.have.length.of.at.least(1);
        expect(body.geography.country).to.have.length.of.at.least(1);

        expect(body.period).to.have.property('gte');
        expect(body.period).to.have.property('lte');

        expect(body.outputs).to.have.length(1);

        clean_dataset();
    });

  });

  // TODO use something more than ACLED, normal data, that supports the most transforms
  // On transform page- apply transforms, (assert after processing jobs)
  it('From Annotate > Transforms.. > Processing modifies the dataset correctly (by elwood/processing)');

});
