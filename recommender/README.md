
# Causal[ity] Recommender API

Make requests, issuing a topic, and receiving causes and/or effects of the given topic!

### Examples

##### Request

```bash
curl --request POST \
  --url http://0.0.0.0:8084/causal-recommender/causes \
  --header 'Content-Type: application/json' \
  --data '{
	"topic": "privacy paranoia"
    }'
```

##### Response

```json
{
	"causes": [
		"chemical contamination in the food supply",
		"loss of privacy",
		"fluoride in",
		"government control",
		"nuclear proliferation",
		"the media's lies",
		"chemtrails/fog",
		"global warming",
		"NSA spying"
	]
}
```

# Running

```bash
docker-compose up
```
