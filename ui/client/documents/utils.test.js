import React from 'react';
import { calculateHighlightTargets, pdfMetadataToForm } from "./utils";

describe('calculateHighlightTargets', () => {
  test('returns split array with text and expected hightlight data', () => {

    const inputTextContent = "Jul 27, 2015 (The Ethiopian Herald/All Africa Global Media via COMTEX) -- Barack Obama, the President of the United States of America, will visit Ethiopia on July 26, 2015. Obama will become the first sitting US president to visit Ethiopia, an African country with a singular culture.";

    const highlights = "a presidential visit of obama ethiopia 2015";

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


describe('pdfMetadataToForm', () => {
  test('accepts pdf extracted metadata and returns our DB/form data format with defaults filled', () => {
    // NOTE Metadata format from PDF js lib:
    const extractedInput = {
      Author: "Rossa",
      CreationDate: "Fri Dec 02 2011 11:37:02 GMT-0500 (Eastern Standard Time)",
      Creator: "Microsoft Word 2010",
      PageCount: "41",
      Producer: "pdf-lib (https://github.com/Hopding/pdf-lib)",
      Title : "The Cost of Adaptation to Climate Change in Africa"
    };

    const out = pdfMetadataToForm(extractedInput);

    expect(out).toEqual({
      title: "The Cost of Adaptation to Climate Change in Africa",
      description: "",
      author: "Rossa",
      publisher: "",
      producer: "",
      creator: "Microsoft Word 2010",
      original_language: "en",
      stated_genre: "news-article",
      type: "article",
      classification: "unclassified",
      creation_date: "Fri Dec 02 2011 11:37:02 GMT-0500 (Eastern Standard Time)",
      pages: 41
    });

  });

  test('works with multiple items at a time while mapping array', () => {
    const extractedInputs = [{
      Author: "Rossa",
      CreationDate: "Fri Dec 02 2011 11:37:02 GMT-0500 (Eastern Standard Time)",
      Creator: "Microsoft Word 2010",
      PageCount: "41",
      Producer: "pdf-lib (https://github.com/Hopding/pdf-lib)",
      Title : "The Cost of Adaptation to Climate Change in Africa"
    }, {
      Author: undefined,
      CreationDate: "Tue Jan 24 2023 15:24:20 GMT-0500 (Eastern Standard Time)",
      Creator: "TeX",
      PageCount: "8",
      Producer: "pdf-lib (https://github.com/Hopding/pdf-lib)",
      Title: undefined
    }];

    const out = extractedInputs.map(pdfMetadataToForm);

    const compare = out.map((val) => val.author);

    expect(compare).toEqual(["Rossa", ""]);
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
// "Description" : "Sectors Material relief assistance and services (072010): 100% March 2015 - Ethiopia faces a wide variety of humanitarian challenges, including the effects of chronic drought in many areas of the country, widespread food insecurity, an ongoing low to medium intensity conflict in its south-eastern Somali region, and the impact of hosting a growing population of Eritrean, Somali, South Sudanese, and Sudanese refugees on its soil.",
// "OriginalLanguage" : "en",
// "Classification" : "UNCLASSIFIED",
// "Title" : "Ethiopia - Humanitarian Response for South Sudanese Refugees in Gambella - MSF 2015",
// "Publisher" : "Cihan News Agency",
// "Producer" : "Dow Jones",
// "StatedGenre" : "news-article"
