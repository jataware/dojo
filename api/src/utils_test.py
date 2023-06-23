from src.utils import alternate_lists

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
