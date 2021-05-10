package cato

type ContainerStore struct {
	Meta       map[string]interface{} `json:"meta"`
	Id         string                 `json:"id"`
	Name       string                 `json:"name"`
	Image      string                 `json:"image"`
	Launched   string                 `json:"launched"`
	Provisions []string               `json:"provisions"`
	History    []string               `json:"history"`
	Edits      []string               `json:"edits"`
}

func NewContainerStore(id string) *ContainerStore {
	return &ContainerStore{
		Id:         id,
		Provisions: []string{},
		History:    []string{},
		Edits:      []string{},
		Meta:       map[string]interface{}{},
	}
}

func (c *ContainerStore) AddProvisions(provisions []string) {
	for _, s := range provisions {
		c.Provisions = append(c.Provisions, s)
	}
}

func (c *ContainerStore) AddEdits(edits []string) {
	for _, s := range edits {
		c.Edits = append(c.Edits, s)
	}
}

func (c *ContainerStore) AddHistory(history []string) {
	for _, s := range history {
		c.History = append(c.History, s)
	}
}

func (c *ContainerStore) AppendMeta(meta map[string]interface{}) {
	for k, v := range meta {
		c.Meta[k] = v
	}
}
