package cato

import (
	"sync"
)

type MemStore struct {
	// for now we are just going to store image information in memory
	mu sync.RWMutex
	db map[string]*ContainerStore
}

func NewMemStore() *MemStore {
	return &MemStore{
		db: make(map[string]*ContainerStore),
	}
}

func (store *MemStore) Keys() []string {
	keys := make([]string, 0, len(store.db))
	for k := range store.db {
		keys = append(keys, k)
	}
	return keys
}

func (store *MemStore) Get(id string) (*ContainerStore, bool) {
	if val, found := store.db[id]; found {
		return val, true
	}
	return nil, false
}

func (store *MemStore) Add(id string) *ContainerStore {
	store.mu.Lock()
	store.db[id] = NewContainerStore(id)
	store.mu.Unlock()
	return store.db[id]
}

func (store *MemStore) Delete(key string) {
	store.mu.Lock()
	delete(store.db, key)
	store.mu.Unlock()
}

func (store *MemStore) Clear() {
	store.mu.Lock()
	for k := range store.db {
		delete(store.db, k)
	}
	store.mu.Unlock()
}

// Debugging
func (store *MemStore) Dump() map[string]*ContainerStore {
	return store.db
}
