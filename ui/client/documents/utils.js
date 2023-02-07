import React from 'react';

/**
 * highlightText helper. Returns raw data of which words should be highlighted.
 * Easier for testing (see uni test).
 **/
export function calculateHighlightTargets(text, highlights) {

  const partSplitBoundaries = highlights.toLowerCase().split(" ").map(h => `\\b${h}\\b`);

  const parts = text.split(new RegExp(`(${partSplitBoundaries.join("|")})`, 'gi'));

  const highlightWords = highlights
        .toLowerCase()
        .split(" ")
        .map(i => i.trim());

  const highlighted = parts.map((part) => ({
    text: part,
    highlight: highlightWords.includes(part && part.toLowerCase().trim())
  }));

  return highlighted;
}

/**
 *
 **/
export function highlightText(text, highlights) {
  // Split on highlight term and include term into parts, ignore case

  if (!highlights) {
    return text;
  }

  const highlightData = calculateHighlightTargets(text, highlights);

  return (
    <span>
      {highlightData.map((partInfo, idx) => (
        <span
          key={idx}
          style={partInfo.highlight ?
                 {fontWeight: 'bold', background: "yellow"} :
                 {}}
        >
          {partInfo.text}
        </span>
      ))}
    </span>
  );
}

/**
 * TODO
 **/
export function pdfMetadataToForm(pdfExtractedMetadata) {
  return {};
}
