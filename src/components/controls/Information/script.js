import VtkFieldData from 'nxviewer/src/components/controls/Information/FieldData';
import VtkImageData from 'nxviewer/src/components/controls/Information/ImageData';
import VtkMolecule from 'nxviewer/src/components/controls/Information/Molecule';
import VtkPolyData from 'nxviewer/src/components/controls/Information/PolyData';

export default {
  name: 'Information',
  props: ['sourceId'],
  components: {
    VtkFieldData,
    VtkImageData,
    VtkMolecule,
    VtkPolyData,
  },
  computed: {
    source() {
      return this.$proxyManager.getProxyById(this.sourceId);
    },
    available() {
      if (this.source) {
        const ds = this.source.getDataset();
        if (ds && ds.isA) {
          return ds.isA('vtkPolyData') || ds.isA('vtkImageData');
        }
      }
      return false;
    },
  },
};
