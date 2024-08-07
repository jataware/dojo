import React from 'react';

// Includes English stopwords that don't add any semantic meaning to matches:
const DISALLOWED_HIGHLIGHTS = ['ourselves', 'hers', 'between', 'yourself', 'but', 'again', 'there', 'about', 'once', 'during', 'out', 'very', 'having', 'with', 'they', 'own', 'an', 'be', 'some', 'for', 'do', 'its', 'yours', 'such', 'into', 'of', 'most', 'itself', 'other', 'off', 'is', 's', 'am', 'or', 'who', 'as', 'from', 'him', 'each', 'the', 'themselves', 'until', 'below', 'are', 'we', 'these', 'your', 'his', 'through', 'don', 'nor', 'me', 'were', 'her', 'more', 'himself', 'this', 'down', 'should', 'our', 'their', 'while', 'above', 'both', 'up', 'to', 'ours', 'had', 'she', 'all', 'no', 'when', 'at', 'any', 'before', 'them', 'same', 'and', 'been', 'have', 'in', 'will', 'on', 'does', 'yourselves', 'then', 'that', 'because', 'what', 'over', 'why', 'so', 'can', 'did', 'not', 'now', 'under', 'he', 'you', 'herself', 'has', 'just', 'where', 'too', 'only', 'myself', 'which', 'those', 'i', 'after', 'few', 'whom', 't', 'being', 'if', 'theirs', 'my', 'against', 'a', 'by', 'doing', 'it', 'how', 'further', 'was', 'here', 'than'];

/**
 * `highlightText` helper. Returns raw data of which words should be highlighted.
 * Easier for testing (see unit test).
 **/
export function calculateHighlightTargets(text, highlights) {
  const partSplitBoundaries = highlights.toLowerCase().split(' ').map((h) => `\\b${h}\\b`);

  const parts = text.split(new RegExp(`(${partSplitBoundaries.join('|')})`, 'gi'));

  const highlightWords = highlights
    .toLowerCase()
    .split(' ')
    .map((i) => i.trim());

  const highlighted = parts.map((part) => {
    const normalizedPart = part && part.toLowerCase().trim();
    const isDisallowed = DISALLOWED_HIGHLIGHTS.includes(normalizedPart);

    return {
      text: part,
      highlight: !isDisallowed && highlightWords.includes(normalizedPart)
    };
  });

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
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          style={partInfo.highlight
            ? { fontWeight: 'bold', background: 'yellow' }
            : {}}
        >
          {partInfo.text}
        </span>
      ))}
    </span>
  );
}

/**
 * Promise API for reading binary string
 **/
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onabort = reject;
    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

/**
 * TODO check if we had this fn in project
 **/
export function formatBytes(bytes, decimals) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals || 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
}
