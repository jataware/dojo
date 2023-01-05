import React from 'react';
import { Field, Formik, Form } from 'formik';
import identity from 'lodash/identity';

import { ParagraphTile } from '../client/documents';

export default {
  title: 'Document Explorer/Paragraph Tile',
  component: ParagraphTile,
};

const Template = (args) => (
  <div>
    <ParagraphTile {...args} />
    <ParagraphTile {...args} />
    <ParagraphTile {...args} />
  </div>
);

export const Basic = Template.bind({});
Basic.args = {
  paragraph: {
    id: "20d0a7a4-c8c7-478e-b62e-b89972f67ce0",
    text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.  Donec hendrerit tempor tellus.  Donec pretium posuere tellus.  Proin quam nisl, tincidunt et, mattis eget, convallis nec, purus.  Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.  Nulla posuere.  Donec vitae dolor.  Nullam tristique diam non turpis.  Cras placerat accumsan nulla.  Nullam rutrum.  Nam vestibulum accumsan nisl."
  },
  onClick: identity,
  highlights: "lorem nascetur amet" // TODO test with adding substring "ll"
};
