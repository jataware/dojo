import re
import urllib.parse


def clean_and_decode_str(text: str) -> str:
    """
    Given a `text` input string that is optionally url encoded, decodes
    it and strips special, non-word, characters out (eg %, ^, &, $, >, etc)
    and returns the clean, easy to read and semantic search, text only.
    """

    # Handle case when encoding spaces with `+` instead of %20
    text = text.replace('+',' ')
    url_decoded = urllib.parse.unquote(text)

    return ' '.join(re.sub(r'[^\w\s]', '', url_decoded).split())
