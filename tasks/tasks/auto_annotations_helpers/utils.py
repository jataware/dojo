from __future__ import annotations
import re

from typing import TypeVar

# Could be more complicated, e.g. use UI to ask user


def ask_user(prompt: str) -> str:
    return 'None' #for now, just leave unsure parts as empty
    return input(prompt)


def enum_to_keys(enum):
    return [e.name for e in enum]


T = TypeVar('T')


def inplace_replace(l: list[T], old: T, new: T):
    """In place replacement of old with new"""
    i = l.index(old)
    l[i] = new


def is_known_strftime_directive(directive):
    known_directives = set([
        "%a", "%A", "%w", "%d", "%b", "%B", "%m", "%y", "%Y", "%H", "%I", "%p", "%M", "%S",
        "%f", "%z", "%Z", "%j", "%U", "%W", "%c", "%x", "%X", "%G", "%u", "%V", "%g",
        "%%",  # Escaped percent sign (represents a literal '%')
    ])
    return directive in known_directives


def is_valid_strftime_format(format_code):
    # Find all potential strftime codes in the input (anything that looks like '%X')
    potential_codes = re.findall("%.", format_code)
    # Check each code against the list of known directives
    for code in potential_codes:
        if not is_known_strftime_directive(code):
            return False
    return True
