import Datasets from 'nxviewer/src/components/core/Datasets';
import EditTools from 'nxviewer/src/components/core/EditTools';
import GlobalSettings from 'nxviewer/src/components/core/GlobalSettings';

// ----------------------------------------------------------------------------

export default {
  name: 'ControlsDrawer',
  components: {
    Datasets,
    EditTools,
    GlobalSettings,
  },
  data() {
    return {
      activeTab: 0,
    };
  },
};
