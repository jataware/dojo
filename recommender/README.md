
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

If the image has not been built before, or the cache that downloads the model is busted and we're rebuilding the image, you'll have to wait for the huggingface transformers library to download the decently-sized `gpt2-xl` text-transform model (6.43 GB). This will also be the case when modifying requirements.txt

# Integration With Other Dojo Services

Integration setup has been completed for dojo docker-compose overrides. Ensure your .envfile contains:

```
RECOMMENDER_HOST=recommender
RECOMMENDER_PORT=8084
```

and, if using outside of docker, ensure  the `TRANSFORMERS_CACHE` environment variable is set to yur preferred cache location. Else, it will default to `$HOME/.cache/huggingface`

