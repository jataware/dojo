import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from .hybrid_search import generate_report 


# pytest scripts/hybrid_search_test.py -s -vv


RESULTS = {
    'keyword_query_v1': {
        '8a143348-f0bd-4142-9661-2ca7e5806433-SE.SEC.NENR.FE': {
            'Education indicators female': {
                'index': None,
                'took': 49
            },
            'education affecting economy': {
                'index': None,
                'took': 48
            },
            'education indicators': {
                'index': None,
                'took': 52
            },
            'female': {
                'index': 81,
                'took': 48
            },
            'poverty rate indicators from female population': {
                'index': None,
                'took': 16
            },
            'ratio girls school': {
                'index': None,
                'took': 50
            },
            'school enrollment': {
                'index': 24,
                'took': 52
            },
            'women': {
                'index': None,
                'took': 16
            },
            'women enrolled in education programs': {
                'index': None,
                'took': 16
            }
        },
        'b1a6c625-69a1-4399-b3cb-68cf484826a7-TX.VAL.TRAN.ZS.WT': {
            'Rent cars': {
                'index': None,
                'took': 51
            },
            'Service for all transport types': {
                'index': 23,
                'took': 48
            },
            'Services for all types of transport: air, sea, land, etc': {
                'index': 4,
                'took': 51
            },
            'TX.VAL.TRAN.ZS.WT': {
                'index': 0,
                'took': 12
            },
            'Transport': {
                'index': 1,
                'took': 34
            },
            'Transport services': {
                'index': 1,
                'took': 34
            },
            'services that exclude freight insurance': {
                'index': 4,
                'took': 49
            }
        }
    },
    'semantic_search_query': {
        '8a143348-f0bd-4142-9661-2ca7e5806433-SE.SEC.NENR.FE': {
            'Education indicators female': {
                'index': 88,
                'took': 48
            },
            'education affecting economy': {
                'index': None,
                'took': 47
            },
            'education indicators': {
                'index': 78,
                'took': 48
            },
            'female': {
                'index': None,
                'took': 48
            },
            'poverty rate indicators from female population': {
                'index': None,
                'took': 53
            },
            'ratio girls school': {
                'index': 37,
                'took': 48
            },
            'school enrollment': {
                'index': 19,
                'took': 48
            },
            'women': {
                'index': None,
                'took': 48
            },
            'women enrolled in education programs': {
                'index': 25,
                'took': 49
            }
        },
        'b1a6c625-69a1-4399-b3cb-68cf484826a7-TX.VAL.TRAN.ZS.WT': {
            'Rent cars': {
                'index': 44,
                'took': 58
            },
            'Service for all transport types': {
                'index': 0,
                'took': 70
            },
            'Services for all types of transport: air, sea, land, etc': {
                'index': 0,
                'took': 48
            },
            'TX.VAL.TRAN.ZS.WT': {
                'index': 9,
                'took': 58
            },
            'Transport': {
                'index': 2,
                'took': 56
            },
            'Transport services': {
                'index': 0,
                'took': 49
            },
            'services that exclude freight insurance': {
                'index': 0,
                'took': 48
            }
        }
    }
}

def test_generate_report():

     assert generate_report(RESULTS) == {
         'keyword_query_v1': {
             'index_avg': 17,
             'none_count': 8,
             'took_avg': 39
         },
         'semantic_search_query': {
             'index_avg': 25,
             'none_count': 4,
             'took_avg': 52
         }
     }
