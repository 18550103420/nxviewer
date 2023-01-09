import Information from 'nxviewer/src/components/controls/Information';
import Slice from 'nxviewer/src/components/controls/SliceControl';

export default [
  {
    component: Slice,
    defaultExpand: true,
    icon: 'mdi-tune',
    name: 'Slice',
    visible: (source) => source.getDataset().isA('vtkImageData'),
  },
  {
    component: Information,
    defaultExpand: false,
    icon: 'mdi-help-circle-outline',
    name: 'Information',
    visible: (source) =>
      source.getDataset().isA('vtkPolyData') ||
      source.getDataset().isA('vtkImageData'),
  },
];
