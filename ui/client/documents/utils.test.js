import React from 'react';
import { calculateHighlightTargets } from "./utils";

describe('calculateHighlightTargets', () => {
  test('returns split array with text and expected hightlight data', () => {

    const inputTextContent = "Jul 27, 2015 (The Ethiopian Herald/All Africa Global Media via COMTEX) -- Barack Obama, President of the United States of America, will visit Ethiopia on July 26, 2015. Obama will become the first sitting US president to visit Ethiopia.";

    const highlights = "a presidential visit obama ethiopia 2015";

    const output = calculateHighlightTargets(inputTextContent, highlights);

    expect(output).toEqual([
      { text: 'Jul 27, ', highlight: false },
      { text: '2015', highlight: true },
      {
        text: ' (The Ethiopian Herald/All Africa Global Media via COMTEX) -- Barack ',
        highlight: false
      },
      { text: 'Obama', highlight: true },
      {
        text: ', President of the United States of America, will ',
        highlight: false
      },
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
      { text: '.', highlight: false }
    ]);
  });
});
