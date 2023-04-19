import React from 'react';
import { formatExtensionForDropZone } from "./DropArea";

describe('formatExtensionForDropZone', () => {
  test('Properly formats extension characters into an object with ext:content type mappings', () => {
    const input = ['.csv', 'pdf'];
    const output = formatExtensionForDropZone(input);

    expect(output).toEqual({
      'text/csv': [ '.csv' ],
      'application/pdf': [ '.pdf' ]
    });
  });
});
