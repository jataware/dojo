import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export function useModel(modelId) {
  const { data, error } = useSWR(modelId ? `/api/dojo/models/${modelId}` : null, fetcher);
  return {
    model: data,
    modelIsLoading: !error && !data,
    modelIsError: error,
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
