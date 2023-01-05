import React from 'react';

/**
 *
 **/
export function highlightText(text, highlights) {
  // Split on highlight term and include term into parts, ignore case

  if (!highlights) {
    return text;
  }

  const highlightChunks = highlights.toLowerCase().split(" ").map(h => `${h}`); // .map(h => `${h}\s`);

  // console.log('highlight chunks', highlightChunks);

  const parts = text.split(new RegExp(`(${highlightChunks.join("|")})`, 'gi'));

  // console.log("parts", parts);

  // TODO do proper regex-foo to not match tokens within a word in the query.

  return (
    <span>
      {parts.map((part, i) => (
        <span
          key={i}
          style={highlightChunks.includes(part.toLowerCase()) ?
                 { fontWeight: 'bold', background: "yellow"/* , outline: "2px solid yellow" */ } :
                 {}}
        >
          {part}
        </span>
      ))}
    </span>
  );
}
