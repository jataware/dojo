
export function gen_tranform_intercepts(dataset_id, jobName, result) {
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
