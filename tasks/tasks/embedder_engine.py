# import torch
# from sentence_transformers import SentenceTransformer
from typing import List
from openai.embeddings_utils import get_embeddings
import numpy as np


class __OnlineEmbedder__:
    def embed(self, sentences: List[str]):
        return np.array(get_embeddings(sentences, engine="text-embedding-ada-002"))


embedder = __OnlineEmbedder__()


# NOTE This is the previous offline_embedder implementation with old model
# class __Embedder__:
#     """
#     Convert a list of strings to embeddings
#     Example:
#     ```
#     embedder = __Embedder__(cuda=True) # with cuda
#     sentences = ['this is a sentence', 'this is another sentence', 'this is a third sentence']
#     embeddings = embedder.embed(sentences)
#     ```
#     """
#     def __init__(self, *, model='all-mpnet-base-v2', cuda=False, batch_size=32):

#         self.batch_size = batch_size

#         # create an instance of the model, and optionally move it to GPU
#         with torch.no_grad():
#             self.model = SentenceTransformer(model)
#             if cuda:
#                 self.model = self.model.cuda()

#     def embed(self, sentences: List[str]):
#         """
#         Embed a list of sentences. Pass a list of one item to effectively
#         embedd only one sentence.
#         """
#         with torch.no_grad():
#             embeddings = self.model.encode(sentences, batch_size=self.batch_size, show_progress_bar=False)

#         return [e for e in embeddings]  # convert to list

# embedder = __Embedder__()

