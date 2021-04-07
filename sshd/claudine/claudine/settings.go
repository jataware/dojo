package claudine

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"path/filepath"
	"sync"
)

type Rules struct {
	Block  []string `json:"block"`
	Prompt []string `json:"prompt"`
}

type Settings struct {
	sync.RWMutex
	Rules Rules
}

func NewSettings(fp string) *Settings {

	settings := Settings{}
	filename, _ := filepath.Abs(fp)
	yamlFile, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Fatalf("error loading yaml: %v", err)
		return &settings
	}

	err = yaml.Unmarshal(yamlFile, &settings)
	if err != nil {
		log.Fatalf("error unmarshal yaml: %v", err)
		return &settings
	}

	return &settings
}

func (settings *Settings) SetRules(rules Rules) {
	settings.Lock()
	block := make([]string, len(rules.Block))
	copy(block, rules.Block)
	prompt := make([]string, len(rules.Prompt))
	copy(prompt, rules.Prompt)
	settings.Rules = Rules{Block: block, Prompt: prompt}
	settings.Unlock()
}

func (settings *Settings) GetRules() Rules {
	rules := Rules{
		Block:  settings.Rules.Block,
		Prompt: settings.Rules.Prompt,
	}
	return rules
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func (settings *Settings) RemoveRules(rules *Rules) {
	block := []string{}
	for _, a := range settings.Rules.Block {
		if !(contains(rules.Block, a)) {
			block = append(block, a)
		}
	}

	prompt := []string{}
	for _, a := range settings.Rules.Prompt {
		if !(contains(rules.Prompt, a)) {
			prompt = append(prompt, a)
		}
	}

	newRules := Rules{
		Block:  block,
		Prompt: prompt,
	}
	settings.SetRules(newRules)
}

func (settings *Settings) MergeRules(rules *Rules) {
	newRules := Rules{
		Block:  append(settings.Rules.Block, rules.Block...),
		Prompt: append(settings.Rules.Prompt, rules.Prompt...),
	}
	settings.SetRules(newRules)
}
