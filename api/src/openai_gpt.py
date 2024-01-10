import os
# import numpy as np
# import tiktoken
import openai
from typing import Generator, Literal, Optional
from enum import Enum
import logging
import re


logger = logging.getLogger(__name__)


class Role(str, Enum):
    system = "system"
    assistant = "assistant"
    user = "user"


class Message(dict):
    """Message format for communicating with the OpenAI API."""

    def __init__(self, role: Role, content: str):
        super().__init__(role=role.value, content=content)


class Agent:
    def __init__(self, model: Literal['gpt-4', 'gpt-4-1106-preview']):
        self.model = model

    def oneshot_sync(self, prompt: str, query: str) -> str:
        completion = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                Message(role=Role.system, content=prompt),
                Message(role=Role.user, content=query)
            ],
        )
        result = completion['choices'][0]['message']['content']
        return result

    def oneshot_streaming(self, prompt:str, query:str) -> Generator[str, None, None]:
        gen = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                Message(role=Role.system, content=prompt),
                Message(role=Role.user, content=query)
            ],
            stream=True
        )
        for chunk in gen:
            try:
                yield chunk["choices"][0]["delta"]['content']
            except:
                pass


def set_openai_key(api_key: Optional[str] = None):
    # check that an api key was given, and set it
    if api_key is None:
        api_key = os.environ.get('OPENAI_API_KEY', None)
    if not api_key:
        raise Exception("No OpenAI API key given. Please set the OPENAI_API_KEY environment variable or pass the api_key argument to set_openai_key()")
    openai.api_key = api_key


class GPT4Synthesizer:
    def __init__(self, model: Literal['gpt-4', 'gpt-4-1106-preview']):
        self.agent = Agent(model=model)

    def ask(self, query:str, paragraphs:list[str], stream:bool=False):
        """answer a query with an LLM given a list of paragraphs"""

        # use gpt-4-turbo to answer the question based on the results
        context = "\n\n".join([f"[{i}]: {paragraph}" for i, paragraph in enumerate(paragraphs)])
        prompt="You are a librarian. Users will ask you questions, and you should answer based on relevant snippets of the documents available. Your library database will automatically provide you with possibly relevant snippets. Please cite phrases/sentences in your answer with the number(s) of the relevant snippet(s) (e.g. [5], or [6][7][13])"
        query=f'user query:"{query}"\n\nrelevant document snippets:\n{context}\n\nyour answer: '
        if stream:
            answer = self.agent.oneshot_streaming(prompt, query)
        else:
            answer = self.agent.oneshot_sync(prompt, query)

        return answer


class GPT4CausalRecommender:
    def __init__(self, model: Literal['gpt-4', 'gpt-4-1106-preview'], max_results: int = 5):
        self.agent = Agent(model=model)
        self.max_results = max_results

    def get_links(self, topic: str, paragraphs: list[str], cause: bool) -> tuple[list[tuple[str, list[int]]], bool]:
        """
        predict possible causes or effects of a topic given a list of paragraphs
        if no links are found, run an ungrounded prediction
        """

        link_type = 'cause' if cause else 'effect'

        # ground the prediction of causes in the given paragraphs
        context = "\n\n".join([f"[{i}]: {paragraph}" for i, paragraph in enumerate(paragraphs)])
        prompt=f'You are a causal link recommender. You are given a topic and a list of possibly relevant snippets of text. Please provide a list of possible {link_type}s of the topic. Each possible {link_type} should be a short one or two word topic. Your answer should be a comma separated list of topics, including citations at the end of each topic (e.g. topic one[2][4], topic two[1][4], topic three[5], ...). Please output no more than {self.max_results} topics. If there are no relevant {link_type}s in the paragraphs, just output an empty list. Do not output any other comments'
        query=f'topic: {topic}\n\nrelevant document snippets:\n{context}\n\nyour answer: '
        raw_answer = self.agent.oneshot_sync(prompt, query)

        # parse the results from the raw answer
        answer = self.parse_grounded_answer(raw_answer)
        if len(answer) > 0:
            logger.info("Returning grounded answer.")
            is_grounded = True
            return (answer, is_grounded)

        # if no causes were found, run an ungrounded prediction
        prompt=f'You are a causal link recommender. You are given a topic. Please provide a list of possible {link_type}s of the topic. Each possible {link_type} should be a short one or two word topic. Your answer should be a comma separated list of topics (e.g. topic one, topic two, topic three, ...). Please output no more than {self.max_results} topics. Do not output any other comments'
        query=f'topic: {topic}\n\nyour answer: '
        raw_answer = self.agent.oneshot_sync(prompt, query)

        logger.info("Returning non-grounded answer.")
        # parse the results from answer
        answer = self.parse_ungrounded_answer(raw_answer)
        answer = [(a, []) for a in answer]  # add empty citations for each topic
        is_grounded = False
        return (answer, is_grounded)

    def get_causes(self, topic: str, paragraphs: list[str]) -> tuple[list[tuple[str, list[int]]], bool]:
        """
        predict possible causes of a topic given a list of paragraphs
        if no causes are found, run an ungrounded prediction
        """
        return self.get_links(topic, paragraphs, cause=True)

    def get_effects(self, topic: str, paragraphs: list[str]) -> tuple[list[tuple[str, list[int]]], bool]:
        """
        predict possible effects of a topic given a list of paragraphs
        if no effects are found, run an ungrounded prediction
        """
        return self.get_links(topic, paragraphs, cause=False)

    @staticmethod
    def parse_grounded_answer(answer: str) -> list[tuple[str, list[int]]]:
        items = [i.strip() for i in answer.split(',')]

        def parse_item(item: str):
            """split an item of the form 'topic name[i][j][k]' into ('topic name', [i,j,k]), where i,j,k are integers"""
            text_match = re.search(r'^[^\[]+', item)
            if not text_match:
                return None
            text = text_match.group().strip()
 
            citations_match = re.findall(r'\[(\d+)\]', item)
            if not citations_match:
                return None
            citations = [int(c) for c in citations_match]

            return (text, citations)

        answers = [parse_item(item) for item in items]
        answers = [a for a in answers if a is not None]

        return answers

    @staticmethod
    def parse_ungrounded_answer(answer: str) -> list[str]:
        return [i.strip() for i in answer.split(',')]
