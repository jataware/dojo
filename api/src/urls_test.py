from src.urls import clean_and_decode_str

def test_clean_and_decode_str():

    inputs = ["Hello World #$*(&)",
              "hiya!",
              "Natural Resources and Mineral rents",
              "Natural%20Resources%20and%20Mineral%20rents",
              "searching%20%3E%20%%20symbol",
              "search #$&*^ #$* symbol2",
              "co%de !@#$%^&*() well",
              "co%20e !@#$%^&*() well",
              "co$e !@#$%^&*() well",
              "test % test",
              # weird technique of encoding spaces with `+` scenario
              "Population+per+3km+square+resolution",
              ]

    outputs = ["Hello World",
               "hiya",
               # Sentences with no special chars are preserved
               "Natural Resources and Mineral rents",
               #  same result for input spaces url encoded:
               "Natural Resources and Mineral rents",
               "searching symbol",
               "search symbol2",
               # Notice how %de breaks encoding and causes the `e` to disappear:
               "co well",
               "co e well",
               "coe well", # $ is gone-> not a special url encoding char like %
               "test test",
               # Replaces + with spaces, does not remove them
               "Population per 3km square resolution",
               ]

    for idx, item in enumerate(inputs):
        assert clean_and_decode_str(item) == outputs[idx], \
            f"Item={item} at index={idx} failed"
