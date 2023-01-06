import { mapGetters, mapState, mapActions } from 'vuex';

import GirderBox from 'nxviewer/src/components/core/GirderBox';

// ----------------------------------------------------------------------------

export default {
  name: 'FileLoader',
  components: {
    GirderBox,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      active_tab: 1,
    };
  },
  mounted() {
    this.$root.$on('open_girder_panel', () => {
      this.active_tab = 1;
    });
  },
  computed: {
    ...mapState('files', {
      // show file list with recent on top
      fileList: (state) => Array.from(state.fileList).reverse(),
      // if there are files that are not ready nor error
      pendingFiles: (state) =>
        state.fileList.reduce(
          (flag, file) =>
            flag || (file.state !== 'ready' && file.state !== 'error'),
          false
        ),
      hasReadyFiles: (state) =>
        state.fileList.reduce(
          (flag, file) => flag || file.state === 'ready',
          false
        ),
    }),
    ...mapGetters('files', ['anyErrors']),
  },
  methods: {
    ...mapActions('files', [
      'openFiles',
      'promptLocal',
      'deleteFile',
      'load',
      'resetQueue',
    ]),
    loadFiles() {
      this.loading = true;
      this.load().finally(() => {
        this.close();
        this.$emit('load');
        // hack to keep the load button disabled until window closes
        setTimeout(() => {
          this.loading = false;
        }, 10);
      });
    },
    deleteFileAtRevIndex(revIdx) {
      return this.deleteFile(this.fileList.length - 1 - revIdx);
    },
    onDialogChange(state) {
      if (!state) {
        this.close();
      } else {
        this.$emit('input', true);
      }
    },
    close() {
      this.$emit('input', false);
      // hack to reset queue only after the file dialog closes
      setTimeout(() => this.resetQueue(), 10);
    },
  },
};
