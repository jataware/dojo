package cato

type ClouseauWorker struct {
	Host   string  `json:"host"`
	Docker *Docker `json:"-"`
}

type ClouseauWorkerPool struct {
	Workers []ClouseauWorker
}

func NewClouseauWorkerPool(settings *Settings) (*ClouseauWorkerPool, error) {
	pool := &ClouseauWorkerPool{Workers: make([]ClouseauWorker, 0)}
	for _, host := range settings.Docker.Hosts {
		if docker, err := NewDocker(host); err != nil {
			return pool, err
		} else {
			pool.Workers = append(pool.Workers, ClouseauWorker{
				Host:   host,
				Docker: docker,
			})
		}
	}
	return pool, nil
}
