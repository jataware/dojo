from transformers import pipeline, set_seed, logging

import os
from os import listdir

import re
import torch
from typing import List


# gpt2_snapshot_path = "models--gpt2-xl/snapshots"
# base_cache_dir = os.path.join(os.environ.get('TRANSFORMERS_CACHE', './'), gpt2_snapshot_path)

# cache_loc = ""

# # errors if no folder present..
# try:
#     ls = listdir(base_cache_dir)
#     cache_loc = os.path.join(base_cache_dir, ls[0])
# except FileNotFoundError:
#     # Handled below anyways.
#     pass


# print(f"cache_location: {cache_loc}")

print(f"Transformers top-level env var dir: {os.environ.get('TRANSFORMERS_CACHE')}")


class CausalRecommender:
    """
    """

    def __init__(self, model_name='gpt2-xl', device=None):

        print("Initializing Causal Recommender Engine")

        logging.set_verbosity_debug()

        if device is None:
            device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

        self.generator = pipeline('text-generation', model=model_name, device=device)

        # TODO do cache top-level folder, use folder id within
        # try:
        #     print(f"trying to use model cache")
        #     self.generator = pipeline('text-generation', model=cache_loc, device=device)
        #     print(f"successfuly loaded model cache")
        # except OSError:
        #     print(f"No cache. Downloading model...")
        #     self.generator = pipeline('text-generation', model=model_name, device=device)
        #     print(f"No cache. Saving downloaded model...")
        #     self.generator.save_pretrained(base_cache_dir)
        #     print(f"Saved downloaded model.")
        #     # self.generator.save_pretrained(cache_loc)

        set_seed(42)
        self.template = lambda topic, is_cause: f"""General knowledge test. Please answer the following questions with single words or short phrases:

what are 3 causes of famine in America?
1. income inequality
2. lack of affordable housing
3. systemic racism

what are 3 effects of solar flares?
1. power outages
2. radio interference
3. auroras

what are 3 {'causes' if is_cause else 'effects'} of {topic}?
1."""

    @staticmethod
    def extract_causes(prompt: str, output: str) -> List[str]:
        output = output[len(prompt)-2:] #remove the prompt from the output, but keep the first number and dot ("1.")
        lines = output.split('\n')

        # Remove any extra whitespace on lines, and remove any empty lines
        lines = [line.strip() for line in lines]
        lines = [line for line in lines if line]

        causes = []
        for line in lines:
            if not re.search(r'\d\.', line):
                break  # When the pattern breaks, stop adding causes.
                       #   the model may have asked a new question to continue the pattern

            # Extract the cause without the number and dot
            line = re.sub(r'\d\.', '', line)
            line = line.strip()
            if line: # only if the line is not empty
                causes.append(line)

        return causes


    def get_results(self, topic: str, is_cause: bool) -> List[str]:
        prompt = self.template(topic, is_cause)

        print("generating recommender results")

        outputs = self.generator(prompt, max_length=100, num_return_sequences=3, pad_token_id=50256)

        print("finished generating recommeder results")

        causes = set()
        for output in outputs:
            causes_i = CausalRecommender.extract_causes(prompt, output['generated_text'])
            causes.update(causes_i)

        return list(causes)

    def get_causes(self, topic: str) -> List[str]:
        return self.get_results(topic, True)

    def get_effects(self, topic: str) -> List[str]:
        return self.get_results(topic, False)


print("Loading recommender model/engine")

recommender_engine = CausalRecommender(device='cpu')  # also known as model

print("Loaded recommender model/engine")



def main():
    print('Enter a topic to generate causes or effects for.\ne.g. "causes of climate change" or "effects of inflation".\nIf none is specified, "causes" is assumed.')
    while True:
        topic = input('>>> ')
        if topic.startswith('causes of'):
            is_cause = True
            topic = topic[9:].strip()
        elif topic.startswith('effects of'):
            is_cause = False
            topic = topic[10:].strip()
        else:
            #move the terminal back one line
            print('\033[F', end='')
            print(f'>>> causes of {topic}')
            is_cause = True
            topic = topic.strip()

        results = recommender_engine.get_results(topic, is_cause)
        for result in results:
            print(f'- {result}')


if __name__ == '__main__':
    main()
