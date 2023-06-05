import { calculateHighlightTargets } from './utils';

describe('calculateHighlightTargets', () => {
  test('returns split array with text and expected hightlight data', () => {
    const inputTextContent = 'Jul 27, 2015 (The Ethiopian Herald/All Africa Global Media via COMTEX) -- Barack Obama, the President of the United States of America, will visit Ethiopia on July 26, 2015. Obama will become the first sitting US president to visit Ethiopia, an African country with a singular culture.';

    const highlights = 'a presidential visit of obama ethiopia 2015';

    const output = calculateHighlightTargets(inputTextContent, highlights);

    expect(output).toEqual([
      { text: 'Jul 27, ', highlight: false },
      { text: '2015', highlight: true },
      {
        text: ' (The Ethiopian Herald/All Africa Global Media via COMTEX) -- Barack ',
        highlight: false
      },
      { text: 'Obama', highlight: true },
      { text: ', the President ', highlight: false },
      { text: 'of', highlight: false },
      { text: ' the United States ', highlight: false },
      { text: 'of', highlight: false },
      { text: ' America, will ', highlight: false },
      { text: 'visit', highlight: true },
      { text: ' ', highlight: false },
      { text: 'Ethiopia', highlight: true },
      { text: ' on July 26, ', highlight: false },
      { text: '2015', highlight: true },
      { text: '. ', highlight: false },
      { text: 'Obama', highlight: true },
      {
        text: ' will become the first sitting US president to ',
        highlight: false
      },
      { text: 'visit', highlight: true },
      { text: ' ', highlight: false },
      { text: 'Ethiopia', highlight: true },
      { text: ', an African country with ', highlight: false },
      { text: 'a', highlight: false },
      { text: ' singular culture.', highlight: false }
    ]);
  });
});

// Sample format from DART sample extracted doc data

// "CreationDate" : "2011-12-02",
// "ModDate" : "2011-12-02",
// "Author" : "Rossa",
// "Title" : "The Cost of Adaptation to Climate Change in Africa",
// "Pages" : 41,
// "Creator" : ""
// "Type" : "article",
// "Description" : "Some long text",
// "OriginalLanguage" : "en",
// "Classification" : "UNCLASSIFIED",
// "Title" : "Ethiopia - Humanitarian Response for South Sudanese Refugees in Gambella - MSF 2015",
// "Publisher" : "Cihan News Agency",
// "Producer" : "Dow Jones",
// "StatedGenre" : "news-article"
