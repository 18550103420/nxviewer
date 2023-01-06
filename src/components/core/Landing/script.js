import DragAndDrop from 'nxviewer/src/components/widgets/DragAndDrop';

export default {
  name: 'Landing',
  components: {
    DragAndDrop,
  },
  data() {
    return {
      version: window.VIEWER_VERSION || 'no version available',
    };
  },
  methods: {},
};
