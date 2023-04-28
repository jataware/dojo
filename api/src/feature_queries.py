from src.embedder_engine import embedder


def keyword_query_v2(term):
    q = {
        "query": {
            "bool": {
                "should": [
                    {
                        "multi_match": {
                            "query": term,
                            "operator": "and",
                            "fuzziness": "AUTO",
                            "fields": ["display_name", "name", "description"],
                            "type": "most_fields",
                            "slop": 2
                        }
                    },
                    {
                        "bool": {
                            "minimum_should_match": 1,
                            "should": [
                                {
                                    "match_phrase": {
                                        "description": {
                                            "query": term,
                                            "boost": 1
                                        }
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "name": {
                                            "query": term,
                                            "boost": 1
                                        }
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "display_name": {
                                            "query": term,
                                            "boost": 1
                                        }
                                    }
                                },
                                {
                                    "multi_match": {
                                        "query": term,
                                        "fields": ["display_name", "name", "description"],
                                        "type": "cross_fields",
                                        "operator": "and",
                                        "slop": 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        "_source": {
            "excludes": "embeddings"
        }
    }
    return q


def semantic_search_query(term):

    embedding = embedder.embed([term])[0]

    query = {
        "query": {
            "script_score": {
                "query": {"match_all": {}},
                "script": {
                    "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                    "params": {
                        "query_vector": embedding
                    }
                }
            }
        },
        "_source": {
            "excludes": ["embeddings"]
        }
    }
    return query


def hybrid_query_v1(term):

    embedding = embedder.embed([term])[0]

    features_query = keyword_query_v2(term)

    features_query["query"]["bool"]["should"].append({
        "script_score": {
            "query": {"match_all": {}},
            "script": {
                "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                "params": {
                    "query_vector": embedding
                }
            }
        }
    })
    return features_query


def getWildcardsForAllProperties(t):
    return [{"wildcard": {"name": f"*{t}*"}},
            {"wildcard": {"display_name": f"*{t}*"}},
            {"wildcard": {"description": f"*{t}*"}}]


def keyword_query_v1(term):
    q = {
        "query": {
            "bool": {
                "should": [
                    # NOTE End result format, 3 properties matched for each
                    #      word in text (split by whitespace)
                    # Note: This is a slow search. Use es token indexing features
                    #       in the future
                    # { "wildcard": { "name": wildcardTerm }},
                    # { "wildcard": { "display_name": wildcardTerm }},
                    # { "wildcard": { "description": wildcardTerm }}
                ]
            }
        },
        "_source": {
            "excludes": "embeddings"
        }
    }

    for item in term.split():
        q["query"]["bool"]["should"] += getWildcardsForAllProperties(item)

        return q


def hybrid_query_v0(query):

    embedding = embedder.embed([query])[0]

    features_query = keyword_query_v1(query)

    features_query["query"]["bool"]["should"].append({
        "script_score": {
            "query": {"match_all": {}},
            "boost": 1,
            "script": {
                "source": "Math.max(cosineSimilarity(params.query_vector, 'embeddings'), 0)",
                "params": {
                    "query_vector": embedding
                }
            }
        }
    })
    return features_query
