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
              "I am a paragraph with punctuation; actually, I'm a sentence."
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
               # Looks bad, but semantic search performs better(!):
               "I am a paragraph with punctuation actually Im a sentence"
               ]

    for idx, item in enumerate(inputs):
        assert clean_and_decode_str(item) == outputs[idx], \
            f"Item={item} at index={idx} failed"


# Real staging payloads:
def test_clean_and_decode_str_for_matches():

    inputs = [
        "woody%20species%20diversity",
        "According to the news reporters, the research concluded: \"We suggest other environmental and anthropogenic variables should be taken into consideration in future studies on woody species diversity.\"",
        "- Main report 19825enCHAPTER 2   FORESTS AND TREES PROVIDE VITAL GOODS AND ECOSYSTEM SERVICES BUT ARE UNDERVALUED <. ..> In many countries with low forest cover, trees outside forests constitute the main source of wood products and also non-wood forest products (NWFPs), even though the trees may be scattered. Biodiversity.  Forests harbour most of Earth’s terrestrial biodiversity and its three components – ecosystem, species and genetic diversity. Trees are the foundations of forest ecosystems, and many of the world’s 60 000 tree species7 are also important",
"According to the news editors, the research concluded: \"Study on the structure and regeneration of some woody species indicated that there are species that require urgent conservation measures. Sound management and monitoring, as well as maintenance of biodiversity and cultural and economic values of the forest, require conservation activities that encourage sustainable uses of the forest and its products.\"",
    "The news correspondents obtained a quote from the research from Mekelle University, \"However, works focusing on the effect of topographic factors on woody species diversity are scarce. Understanding the factors that determine woody species diversity is important for management purposes. Therefore, this paper analyzes the effect of altitude, slope, and aspect as topographic variables on woody species diversity in Dawsura exclosure in northern Ethiopia. Data on species identity, abundance, slope, elevation and aspect were recorded from 58 sampling plots. Different diversity indices were used to analyze the data and one-way ANOVA and linear regression was conducted. There were a total of 34 woody species represented 15 families, of which 62% and 38% were trees and shrubs respectively. Altitude (r=0.63, p=0.000 and r=0.794, p<0.01) and slope (r=0.57, p=0.002 and r=0.68, p<0.01) correlated significantly and positively with Shannon diversity, whereas aspect (r=0.12, p=0.378 and r=0.27, p>0.05) did not correlate significantly with Shannon diversity. Woody species diversity at moderate (1.44) and high (1.85) altitudes was significantly different from that of low (0.86) altitude areas (p=0.0013). Furthermore, significantly higher woody species diversity was recorded at steep slope (1.88) and moderately steep slope (1.62) areas as compared to the gentle slope (0.95) areas. No significant variation was observed in woody species diversity among the aspect categories (p >0.05). The study concludes that woody species diversity is largely regulated by slope and altitude than aspect in the exclosure.\"",
    "For more information on this research see: Topographic variables to determine the diversity of woody species in the exclosure of Northern Ethiopia. Heliyon, 2019;6(1):e03121.",
    "Nef, D.P., Gotor, E., Wiederkehr Guerra, G., Zumwald, M. & Kettle, C.J. 2021. Initial investment in diversity is the efficient thing to do for resilient forest landscape restoration. Frontiers in Forests and Global Change.",
    "Tropical and Subtropical Dry Broadleaf ForestsTropical and Subtropical Coniferous Forests Tropical and Subtropical Moist Broadleaf Forest",
    "Pirard, Romain Research Fellow Forests, Biodiversity, Agriculture, Center for International Forestry Research",
    "2012 JAN 10 - (NewsRx.com) -- According to the authors of a study from Addis Ababa, Ethiopia, \"Ecological survey was executed to assess woody species encroachment into the grassland plain of Nechisar National Park (NNP). Forty-one woody species were recorded.\"",
    "\"Location South Gondar, Amhara National Regional State, Northern Ethiopia. The structure and species composition was assessed for 810 plots in 28 church forests. All woody plants were inventoried, identified and measured (stem diameter) in seven to 56 10 m x 10-m plots per forest. In total, 168 woody species were recorded, of which 160 were indigeneous. The basal area decreased with tree harvest intensity; understorey and middle-storey density (< 5 cm DBH trees) decreased with grazing; overstorey density (> 5 cm DBH trees) increased with altitude. The dominance of a small set of species increased with altitude and grazing intensity. Species richness decreased with altitude, mainly due to variation in the richness of the overstorey community. Moreover, species richness in the understorey decreased with grazing intensity. We show how tree harvesting intensity, grazing intensity and altitude contribute to observed variations in forest structure, composition and species richness. Species richness was, however, not related to forest area,\" wrote A. Wassie and colleagues."
              ]


    outputs = [
        "woody species diversity",
        "According to the news reporters the research concluded We suggest other environmental and anthropogenic variables should be taken into consideration in future studies on woody species diversity",
        "Main report 19825enCHAPTER 2 FORESTS AND TREES PROVIDE VITAL GOODS AND ECOSYSTEM SERVICES BUT ARE UNDERVALUED In many countries with low forest cover trees outside forests constitute the main source of wood products and also nonwood forest products NWFPs even though the trees may be scattered Biodiversity Forests harbour most of Earths terrestrial biodiversity and its three components ecosystem species and genetic diversity Trees are the foundations of forest ecosystems and many of the worlds 60 000 tree species7 are also important",
        "According to the news editors the research concluded Study on the structure and regeneration of some woody species indicated that there are species that require urgent conservation measures Sound management and monitoring as well as maintenance of biodiversity and cultural and economic values of the forest require conservation activities that encourage sustainable uses of the forest and its products",
        "The news correspondents obtained a quote from the research from Mekelle University However works focusing on the effect of topographic factors on woody species diversity are scarce Understanding the factors that determine woody species diversity is important for management purposes Therefore this paper analyzes the effect of altitude slope and aspect as topographic variables on woody species diversity in Dawsura exclosure in northern Ethiopia Data on species identity abundance slope elevation and aspect were recorded from 58 sampling plots Different diversity indices were used to analyze the data and oneway ANOVA and linear regression was conducted There were a total of 34 woody species represented 15 families of which 62 and 38 were trees and shrubs respectively Altitude r063 p0000 and r0794 p001 and slope r057 p0002 and r068 p001 correlated significantly and positively with Shannon diversity whereas aspect r012 p0378 and r027 p005 did not correlate significantly with Shannon diversity Woody species diversity at moderate 144 and high 185 altitudes was significantly different from that of low 086 altitude areas p00013 Furthermore significantly higher woody species diversity was recorded at steep slope 188 and moderately steep slope 162 areas as compared to the gentle slope 095 areas No significant variation was observed in woody species diversity among the aspect categories p 005 The study concludes that woody species diversity is largely regulated by slope and altitude than aspect in the exclosure",
        "For more information on this research see Topographic variables to determine the diversity of woody species in the exclosure of Northern Ethiopia Heliyon 201961e03121",
        "Nef DP Gotor E Wiederkehr Guerra G Zumwald M Kettle CJ 2021 Initial investment in diversity is the efficient thing to do for resilient forest landscape restoration Frontiers in Forests and Global Change",
        "Tropical and Subtropical Dry Broadleaf ForestsTropical and Subtropical Coniferous Forests Tropical and Subtropical Moist Broadleaf Forest",
        "Pirard Romain Research Fellow Forests Biodiversity Agriculture Center for International Forestry Research",
        "2012 JAN 10 NewsRxcom According to the authors of a study from Addis Ababa Ethiopia Ecological survey was executed to assess woody species encroachment into the grassland plain of Nechisar National Park NNP Fortyone woody species were recorded",
        "Location South Gondar Amhara National Regional State Northern Ethiopia The structure and species composition was assessed for 810 plots in 28 church forests All woody plants were inventoried identified and measured stem diameter in seven to 56 10 m x 10m plots per forest In total 168 woody species were recorded of which 160 were indigeneous The basal area decreased with tree harvest intensity understorey and middlestorey density 5 cm DBH trees decreased with grazing overstorey density 5 cm DBH trees increased with altitude The dominance of a small set of species increased with altitude and grazing intensity Species richness decreased with altitude mainly due to variation in the richness of the overstorey community Moreover species richness in the understorey decreased with grazing intensity We show how tree harvesting intensity grazing intensity and altitude contribute to observed variations in forest structure composition and species richness Species richness was however not related to forest area wrote A Wassie and colleagues"
               ]

    results = list(map(clean_and_decode_str, inputs))

    for idx, item in enumerate(inputs):
        assert results[idx] == outputs[idx], \
            f"Item={item} at index={idx} failed"
