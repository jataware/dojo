import ColumnPanel from '../client/datasets/annotations/ColumnPanel';
import sampleDataColumns from '../client/datasets/data/sampleDataColumns3';

const columnsBase = sampleDataColumns.map(name => ({field: name}));

export default {
  title: 'Dataset Registration/ColumnPanel',
  component: ColumnPanel,
  argTypes: {
  },
};

const Template = (args) => <ColumnPanel {...args} />;

const annotations = {category: 'feature'};

function annotateColumns(values) {
  console.log(values);
}

export const Base = {
  args: {
    anchorPosition: 'right',
    columns: columnsBase
      .map((column) => ({
        ...column,
        headerName: column.field
      })),
    onClose: () => null,
    columnName: 'date',
    headerName: 'Date',
    annotations,
    annotateColumns,
    inferredData: {},
    multiPartData: {},
    setMultiPartData: () => true
  }
};
