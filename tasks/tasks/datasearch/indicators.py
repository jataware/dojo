import json
from .corpora import Corpus, CorpusLoader


class Indicators(CorpusLoader):
    """
    Description for Indicators loading a corpus for neural semantic search
    """
    @staticmethod
    def get_corpus() -> Corpus[tuple[str,str]]:
        with open('data/indicators.jsonl') as f:
            lines = f.readlines()
            indicators = [json.loads(line) for line in lines]

        docs = {}
        for indicator in indicators:
            indicator_id = indicator['_source']['id']
            for out in indicator['_source']['outputs']:
                #name, display name, description, unit, unit description
                description = \
f"""name: {out['name']};
display name: {out['display_name']};
description: {out['description']};
unit: {out['unit']};
unit description: {out['unit_description']};"""
                docs[(indicator_id, out['name'])] = description


        return Corpus(docs)

    # def set_format_corpus(indicators):
#         """
#         Prepares indicator outputs docs to correct format and returns the new
#         formatted 'docs' wrapped ina Corpus.

#         Only accepts a json array of indicators. Pass an individual indicator
#         within the array to process one indicator at a time.
#         """

#         docs = {}
#         for indicator in indicators:
#             indicator_id = indicator['id']
#             for out in indicator['outputs']:
#                 # name, display name, description, unit, unit description
#                 description = \
# f"""name: {out['name']};
# display name: {out['display_name']};
# description: {out['description']};
# unit: {out['unit']};
# unit description: {out['unit_description']};"""
#                 docs[(indicator_id, out['name'])] = description

#         return Corpus(docs)

