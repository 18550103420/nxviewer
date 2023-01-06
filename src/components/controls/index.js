import ColorBy from 'nxviewer/src/components/controls/ColorBy';
import Information from 'nxviewer/src/components/controls/Information';
import Molecule from 'nxviewer/src/components/controls/Molecule';
import Representation from 'nxviewer/src/components/controls/Representation';
import Slice from 'nxviewer/src/components/controls/SliceControl';

export default [
  {
    component: Representation,
    defaultExpand: true,
    icon: 'mdi-brightness-6',
    name: 'Representation',
    visible: (source) =>
      source.getDataset().isA('vtkPolyData') ||
      source.getDataset().isA('vtkImageData'),
  },
  {
    component: ColorBy,
    defaultExpand: true,
    icon: 'mdi-invert-colors',
    name: 'Colors',
    visible: (source) =>
      source.getDataset().isA('vtkPolyData') ||
      source.getDataset().isA('vtkImageData'),
  },
  {
    component: Slice,
    defaultExpand: true,
    icon: 'mdi-tune',
    name: 'Slice',
    visible: (source) => source.getDataset().isA('vtkImageData'),
  },
  {
    component: Molecule,
    defaultExpand: true,
    icon: 'mdi-molecule',
    name: 'Molecule',
    visible: (source) => source.getDataset().isA('vtkMolecule'),
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
