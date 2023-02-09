import React from 'react';
import snakeCase from 'lodash/snakeCase';
import mapKeys from 'lodash/mapKeys';
import reduce from 'lodash/reduce';
import flow from 'lodash/flow';

/**
 * `highlightText` helper. Returns raw data of which words should be highlighted.
 * Easier for testing (see unit test).
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
                 {fontWeight: 'bold', background: 'yellow'} :
                 {}}
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
export function formatBytes(bytes,decimals) {
  if(bytes == 0) return '0 Bytes';
  var k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Below setup to transform metadata for readyness of form and API shapes.
 **/

const defaultValues = {
  title: '',
  author: '',
  description: '',
  publisher: '',
  producer: '',
  original_language: 'en',
  stated_genre: 'news-article',
  type: 'article',
  classification: 'unclassified',
  creation_date: ''
};

const invalidProducers = ['pdf-lib', 'pdf-lib (https://github.com/Hopding/pdf-lib)'];

const keysMappings = {
  page_count: 'pages'
};

const valueTransforms = {
  pages: Number
};

function renameKeys(key) {
  return keysMappings[key] || key;
}

function transformValues(key, value) {
  if (valueTransforms[key]) {
    return valueTransforms[key](value);
  }
  return value;
}

function formatKey(key) {
  return flow(snakeCase, renameKeys)(key);
}

/**
 *
 **/
export function pdfMetadataToForm(pdfExtractedMetadata) {

  const reduced = reduce(pdfExtractedMetadata, (acc, value, key) => {

    const formattedKey = formatKey(key);
    const isInvalidProducer = formattedKey === 'producer' && Boolean(invalidProducers.includes(value));
    const useDefault = isInvalidProducer || value === undefined;

    // Don't override defaults with undefined nor add excluded keys
    if (useDefault) {
      console.log("using default", formattedKey, value);
      return acc;
    }

    const useValue = transformValues(formattedKey, value);

    acc[formattedKey] = useValue;
    return acc;

    // lodash/reduce's accumulator will be mutated in place (not auto-cloned)
  }, {...defaultValues});

  return reduced;
}
