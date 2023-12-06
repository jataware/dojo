import React from 'react';

export default function CenteredImage({ width, src, title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src={src}  width={width} alt={title} />
      <p><i>{title}</i></p>
    </div>
  );
};
