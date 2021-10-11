import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export function useModel(modelId) {
  const { data, error, mutate } = useSWR(modelId ? `/api/dojo/models/${modelId}` : null, fetcher);

  return {
    model: data,
    modelIsLoading: !error && !data,
    modelIsError: error,
    mutateModel: mutate,
  };
}

export function useModels() {
  const { data, error } = useSWR('/api/dojo/models/latest', fetcher);

  return {
    models: data,
    modelsLoading: !error && !data,
    modelsError: error,
  };
}

export function useContainer(containerId) {
  const { data, error, mutate } = useSWR(
    containerId ? `/api/dojo/clouseau/container/${containerId}` : null, fetcher
  );

  return {
    container: data,
    mutateContainer: mutate,
    containerIsLoading: !error && !data,
    containerIsError: error,
  };
}

export function useConfigs(modelId) {
  const { data, error } = useSWR(modelId ? `/api/dojo/dojo/config/${modelId}` : null, fetcher);

  return {
    configs: data,
    configsLoading: !error && !data,
    configsError: error,
  };
}

export function useOutputFiles(modelId) {
  const { data, error } = useSWR(modelId ? `/api/dojo/dojo/outputfile/${modelId}` : null, fetcher);

  return {
    outputs: data,
    outputsLoading: !error && !data,
    outputsError: error,
  };
}

export function useAccessories(modelId) {
  const { data, error, mutate } = useSWR(
    modelId ? `/api/dojo/dojo/accessories/${modelId}` : null, fetcher
  );

  return {
    accessories: data,
    mutateAccessories: mutate,
    accessoriesLoading: !error && !data,
    accessoriesError: error,
  };
}
