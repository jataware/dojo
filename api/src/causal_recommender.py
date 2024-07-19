from __future__ import annotations

from jatarag.agent import Agent
import logging
import re


logger = logging.getLogger(__name__)


class CausalRecommender:
    def __init__(self, agent: Agent, max_results: int = 5):
        self.agent = agent
        self.max_results = max_results

    def get_links(self, topic: str, paragraphs: list[str], cause: bool) -> tuple[list[tuple[str, list[int]]], bool]:
        """
        predict possible causes or effects of a topic given a list of paragraphs
        if no links are found, run an ungrounded prediction
        """

        link_type = 'cause' if cause else 'effect'

        # ground the prediction of causes in the given paragraphs
        context = "\n\n".join([f"[{i}]: {paragraph}" for i, paragraph in enumerate(paragraphs)])
        prompt = f'You are a causal link recommender. You are given a topic and a list of possibly relevant snippets of text. Please provide a list of possible {link_type}s of the topic. Each possible {link_type} should be a short one or two word topic. Your answer should be a comma separated list of topics, including citations at the end of each topic (e.g. topic one[2][4], topic two[1][4], topic three[5], ...). Please output no more than {self.max_results} topics. If there are no relevant {link_type}s in the paragraphs, just output an empty list. Do not output any other comments'
        query = f'topic: {topic}\n\nrelevant document snippets:\n{context}\n\nyour answer: '
        raw_answer = self.agent.oneshot_sync(prompt, query)

        # parse the results from the raw answer
        answer = self.parse_grounded_answer(raw_answer)
        if len(answer) > 0:
            logger.info("Returning grounded answer.")
            is_grounded = True
            return (answer, is_grounded)

        # if no causes were found, run an ungrounded prediction
        prompt = f'You are a causal link recommender. You are given a topic. Please provide a list of possible {link_type}s of the topic. Each possible {link_type} should be a short one or two word topic. Your answer should be a comma separated list of topics (e.g. topic one, topic two, topic three, ...). Please output no more than {self.max_results} topics. Do not output any other comments'
        query = f'topic: {topic}\n\nyour answer: '
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
