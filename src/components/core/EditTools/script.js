import PaintTool from 'nxviewer/src/components/tools/PaintTool';
import MedianFilter from 'nxviewer/src/components/tools/MedianFilter';

// ----------------------------------------------------------------------------

export default {
  name: 'EditTools',
  components: {
    PaintTool,
    MedianFilter,
  },
  data() {
    return {
      show: [0],
      enabledTool: '',
    };
  },
  methods: {
    setEnabledTool(tool, flag) {
      this.enabledTool = flag ? tool : '';
    },
  },
};
