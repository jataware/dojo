from __future__ import annotations

import openai
# from openai import OpenAI
from typing import Generator, Literal
from enum import Enum
import os


import pdb


class Role(str, Enum):
    system = "system"
    assistant = "assistant"
    user = "user"


class Message(dict):
    """Message format for communicating with the OpenAI API."""

    def __init__(self, role: Role, content: str):
        super().__init__(role=role.value, content=content)


# TODO: make this an abstract class, and have a separate class for each model
class Agent:
    def __init__(self, model: Literal['gpt-4', 'gpt-4-turbo-preview'], timeout=None):
        self.model = model
        self.timeout = timeout

    def oneshot_sync(self, prompt: str, query: str) -> str:
        return self.multishot_sync([
            Message(role=Role.system, content=prompt),
            Message(role=Role.user, content=query)
        ])

    def oneshot_streaming(self, prompt: str, query: str) -> Generator[str, None, None]:
        return self.multishot_streaming([
            Message(role=Role.system, content=prompt),
            Message(role=Role.user, content=query)
        ])

    def multishot_sync(self, messages: list[Message]) -> str:
        # client = OpenAI()
        # completion = client.chat.completions.create(
        #     model=self.model,
        #     messages=messages,
        #     timeout=self.timeout
        # )
        # result = completion.choices[0].message.content
        # return result
        gen = self.multishot_streaming(messages)
        return ''.join([*gen])

    def multishot_streaming(self, messages: list[Message]) -> Generator[str, None, None]:
        # client = OpenAI()
        gen = openai.ChatCompletion.create( #client.chat.completions.create(
            model=self.model,
            messages=messages,
            timeout=self.timeout,
            stream=True
        )
        for chunk in gen:
            try:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
            except:
                pass


def set_openai_key(api_key: str | None = None):
    # check that an api key was given, and set it
    if api_key is None:
        api_key = os.environ.get('OPENAI_API_KEY', None)
    if not api_key:
        raise Exception(
            "No OpenAI API key given. Please set the OPENAI_API_KEY environment variable or pass the api_key argument to set_openai_key()")
    openai.api_key = api_key




# class Agent:
#     def __init__(self, model: Literal['gpt-4', 'gpt-4-turbo-preview'], timeout=None):
#         self.model = model
#         self.timeout = timeout

#     def oneshot_sync(self, prompt: str, query: str) -> str:
#         return self.multishot_sync([
#             Message(role=Role.system, content=prompt),
#             Message(role=Role.user, content=query)
#         ])

#     def oneshot_streaming(self, prompt: str, query: str) -> Generator[str, None, None]:
#         return self.multishot_streaming([
#             Message(role=Role.system, content=prompt),
#             Message(role=Role.user, content=query)
#         ])

#     def multishot_sync(self, messages: list[Message]) -> str:
#         completion = openai.ChatCompletion.create(
#             model=self.model,
#             messages=messages,
#         )
#         result = completion['choices'][0]['message']['content']
#         return result

#     def multishot_streaming(self, messages: list[Message]) -> Generator[str, None, None]:
#         gen = openai.ChatCompletion.create(
#             model=self.model,
#             messages=messages,
#             stream=True
#         )
#         for chunk in gen:
#             try:
#                 yield chunk["choices"][0]["delta"]['content']
#             except:
#                 pass


# def set_openai_key(api_key: Optional[str] = None):
#     # check that an api key was given, and set it
#     if api_key is None:
#         api_key = os.environ.get('OPENAI_API_KEY', None)
#     if not api_key:
#         raise Exception("No OpenAI API key given. Please set the OPENAI_API_KEY environment variable or pass the api_key argument to set_openai_key()")
#     openai.api_key = api_key

