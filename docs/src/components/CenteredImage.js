import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function CenteredImage({ width, file, title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src={useBaseUrl(`/img/${file}`)}  width={width} alt={title} />
      <p><i>{title}</i></p>
    </div>
  );
};
