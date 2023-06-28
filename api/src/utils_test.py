import pytest
from src.utils import alternate_lists, format_hybrid_results


def test_alternate_lists__standard():

    list1 = [1,2,3,4,5,6]
    list2 = [7,8,9,10,11,12]

    output = alternate_lists(list1, list2)

    assert output == [1, 2, 3, 7, 8, 9, 4, 5, 6, 10, 11, 12]
    assert len(output) == 12

def test_alternate_lists__repeated_items():

    list1 = [{"_id": 1}, {"_id": 2}, {"_id": 3}, {"_id": 4}, {"_id": 5}, {"_id": 6}]
    list2 = [{"_id": 7}, {"_id": 8}, {"_id": 9}, {"_id": 1}, {"_id": 2}, {"_id": 3}]

    output = alternate_lists(list1, list2, id_property="_id")

    assert output == [{"_id": 1}, {"_id": 2}, {"_id": 3}, {"_id": 7}, {"_id": 8}, {"_id": 9}, {"_id": 4}, {"_id": 5}, {"_id": 6}]
    assert len(output) == 9


@pytest.mark.unit
def test_format_hybrid_results__simple():
    my_list = [
        {"_id": 1,"_source": {"name": "item1"}, "matched_queries": ["semantic_search"]},
        {"_id": 2,"_source": {"name": "item2"}, "matched_queries": ["semantic_search"]},
        {"_id": 3,"_source": {"name": "item3"}, "matched_queries": ["keyword_name"]},
        {"_id": 4,"_source": {"name": "item4"}, "matched_queries": ["keyword_display_name"]},
        {"_id": 5,"_source": {"name": "item5"}, "matched_queries": ["keyword_description"]},
        {"_id": 6,"_source": {"name": "item6"}, "matched_queries": ["semantic_search"]},
        {"_id": 7,"_source": {"name": "item7"}, "matched_queries": ["semantic_search"]},
        {"_id": 8,"_source": {"name": "item8"}, "matched_queries": ["keyword_display_name"]},
    ]

    out = format_hybrid_results(my_list)

    assert out == [
        {"_id": 3,"_source": {"name": "item3"}, "matched_queries": ["keyword_name"]},
        {"_id": 4,"_source": {"name": "item4"}, "matched_queries": ["keyword_display_name"]},
        {"_id": 5,"_source": {"name": "item5"}, "matched_queries": ["keyword_description"]},
        {"_id": 1,"_source": {"name": "item1"}, "matched_queries": ["semantic_search"]},
        {"_id": 2,"_source": {"name": "item2"}, "matched_queries": ["semantic_search"]},
        {"_id": 6,"_source": {"name": "item6"}, "matched_queries": ["semantic_search"]},
        {"_id": 8,"_source": {"name": "item8"}, "matched_queries": ["keyword_display_name"]},
        {"_id": 7,"_source": {"name": "item7"}, "matched_queries": ["semantic_search"]},
    ]
