import ReaderFactory from 'nxviewer/src/io/ReaderFactory';
import postProcessDataset from 'nxviewer/src/io/postProcessing';
import Vue from 'vue';

// ----------------------------------------------------------------------------

function getSupportedExtensions() {
  return ['glance', 'gz'].concat(ReaderFactory.listSupportedExtensions());
}

// ----------------------------------------------------------------------------

export function getExtension(filename) {
  const i = filename.lastIndexOf('.');
  if (i > -1) {
    return filename.substr(i + 1).toLowerCase();
  }
  return '';
}

// ----------------------------------------------------------------------------

export default ({ proxyManager }) => ({
  namespaced: true,
  state: {
    remoteFileList: [],
    fileList: [],
    loading: false,
    progress: {},
  },

  getters: {
    anyErrors(state) {
      return state.fileList.reduce(
        (flag, file) => flag || file.state === 'error',
        false
      );
    },

    totalProgress(state) {
      const itemProgresses = Object.values(state.progress);
      if (itemProgresses.length === 0) {
        return 0;
      }
      return (
        itemProgresses.reduce((sum, val) => sum + val, 0) /
        itemProgresses.length
      );
    },
  },

  mutations: {
    startLoading(state) {
      state.loading = true;
    },

    stopLoading(state) {
      state.loading = false;
    },

    resetQueue(state) {
      state.fileList = [];
    },

    addToFileList(state, files) {
      console.log(`addToFileList`);
      console.log(`(files.length:${files.length})`);
      for (let i = 0; i < files.length; i++) {
        const fileInfo = files[i];

        console.log(`fileInfo.type:${fileInfo.type}`);
        const fileState = {
          // possible values: needsDownload, needsInfo, loading, ready, error
          state: 'loading',
          name: fileInfo.name,
          ext: getExtension(fileInfo.name),
          files: null,
          reader: null,
          extraInfo: null,
          remoteURL: null,
          proxyKeys: fileInfo.proxyKeys,
        };

        if (fileInfo.type === 'dicom') {
          fileState.files = fileInfo.list;
        }
        if (fileInfo.type === 'regular') {
          fileState.files = [fileInfo.file];
        }
        if (fileInfo.type === 'label') {
          fileState.files = [fileInfo.file];
        }
        state.fileList.push(fileState);
      }
    },

    setFileNeedsInfo(state, index) {
      if (index >= 0 && index < state.fileList.length) {
        state.fileList[index].state = 'needsInfo';
        state.fileList[index].extraInfo = null;
      }
    },
    setFileReader(state, { index, reader }) {
      if (reader && index >= 0 && index < state.fileList.length) {
        state.fileList[index].reader = reader;
        state.fileList[index].state = 'ready';
      }
    },
    setFileError(state, { index, error }) {
      if (error && index >= 0 && index < state.fileList.length) {
        state.fileList[index].error = error;
        state.fileList[index].state = 'error';
      }
    },

    deleteFile(state, index) {
      if (index >= 0 && index < state.fileList.length) {
        state.fileList.splice(index, 1);
      }
    },

    setProgress(state, { id, percentage }) {
      Vue.set(state.progress, id, percentage);
    },

    clearProgresses(state) {
      state.progress = {};
    },
  },

  actions: {
    promptLocal({ dispatch }) {
      const exts = getSupportedExtensions();
      return new Promise((resolve, reject) =>
        ReaderFactory.openFiles(exts, (files) => {
          dispatch('openFiles', Array.from(files)).then(resolve).catch(reject);
        })
      );
    },

    resetQueue({ commit }) {
      commit('resetQueue');
    },

    deleteFile({ commit }, index) {
      commit('deleteFile', index);
    },

    openFiles({ commit, dispatch }, fileList) {
      console.log(`openFiles`);
      let dicomSeriesName = '';
      const labelFileList = [];
      const dicomOriginalFileList = [];
      const niiOriginalFileList = [];
      fileList.forEach((f) => {
        // console.log(f);
        if (f.neuroDataType.includes('original')) {
          // split out dicom and single datasets
          // all dicom files are assumed to be from a single series
          if (getExtension(f.file.name) === 'dcm') {
            dicomSeriesName = f.dispName;
            dicomOriginalFileList.push(f.file);
          } else if (getExtension(f.file.name) === 'gz') {
            niiOriginalFileList.push(f.file);
          }
        } else if (f.neuroDataType.includes('label')) {
          labelFileList.push(f.file);
        }
        // if (getExtension(f.file.name) === 'dcm') {
        //   dicomOriginalFileList.push(f.file);
        // } else () {
        //   labelFileList.push(f);
        // }
      });

      if (dicomOriginalFileList.length) {
        const dicomFile = {
          type: 'dicom',
          name: dicomSeriesName,
          // name: originalFileList[0].name, // pick first file for name
          list: dicomOriginalFileList,
        };
        commit('addToFileList', [dicomFile]);
      }

      if (niiOriginalFileList.length) {
        commit(
          'addToFileList',
          niiOriginalFileList.map((f) => ({
            type: 'regular',
            name: f.name,
            file: f,
          }))
        );
      }

      if (labelFileList.length) {
        commit(
          'addToFileList',
          labelFileList.map((f) => ({
            type: 'label',
            name: f.name,
            file: f,
            proxyKeys: {
              meta: {
                neuroDataType: 'vtkLabelMap',
                colorMap: {
                  0: [0, 0, 0, 0],
                  1: [128, 174, 128, 255],
                  2: [241, 214, 145, 255],
                  3: [177, 122, 101, 255],
                  4: [111, 184, 210, 255],
                  5: [216, 101, 79, 255],
                  6: [221, 130, 101, 255],
                  7: [144, 238, 144, 255],
                },
              },
            },
          }))
        );
      }
      /*
      commit(
        'addToFileList',
        labelFileList.map((f) => ({
          type: 'regular',
          name: f.name,
          file: f,
        }))
      );
      */

      return dispatch('readAllFiles');
    },

    readAllFiles({ dispatch, state }) {
      const readPromises = [];
      for (let i = 0; i < state.fileList.length; i++) {
        readPromises.push(dispatch('readFileIndex', i));
      }

      return Promise.all(readPromises);
    },

    readFileIndex({ commit, state }, fileIndex) {
      console.log(`readFileIndex`);
      const file = state.fileList[fileIndex];
      let ret = Promise.resolve();

      if (file.state === 'ready' || file.state === 'error') {
        return ret;
      }

      if (file.ext === 'dcm') {
        ret = ReaderFactory.loadFileSeries(file.files, 'dcm', file.name).then(
          (r) => {
            if (r) {
              commit('setFileReader', {
                index: fileIndex,
                reader: r,
              });
            }
          }
        );
      } else {
        ret = ReaderFactory.loadFiles(file.files).then((r) => {
          if (r && r.length === 1) {
            commit('setFileReader', {
              index: fileIndex,
              reader: r[0],
            });
          }
        });
      }

      return ret.catch((error) => {
        if (error) {
          commit('setFileError', {
            index: fileIndex,
            error: error.message || 'File load failure',
          });
        }
      });
    },

    load({ state, commit, dispatch }) {
      commit('startLoading');
      console.log(`startLoading`);

      const readyFiles = state.fileList.filter((f) => f.state === 'ready');
      let promise = Promise.resolve();

      promise = promise.then(() => {
        const otherFiles = readyFiles.filter((f) => f.ext !== 'glance');
        const regularFiles = [];
        const labelmapFiles = [];
        for (let i = 0; i < otherFiles.length; i++) {
          const file = otherFiles[i];
          const meta = (file.proxyKeys && file.proxyKeys.meta) || {};
          if (meta.neuroDataType === 'vtkLabelMap') {
            console.log(`labelmapFiles`);
            labelmapFiles.push(file);
          } else {
            console.log(`regularFiles`);
            regularFiles.push(file);
          }
        }

        const loadFiles = (fileList) => {
          let ret = [];
          for (let i = 0; i < fileList.length; i++) {
            const f = fileList[i];
            const readerBundle = {
              ...f.reader,
              metadata: f.reader.metadata || {},
            };

            if (f.remoteURL) {
              Object.assign(readerBundle.metadata, { url: f.remoteURL });
            }

            const meta = f.proxyKeys && f.proxyKeys.meta;
            if (meta) {
              const { reader, dataset } = readerBundle;
              const ds =
                reader && reader.getOutputData
                  ? reader.getOutputData()
                  : dataset;
              Object.assign(readerBundle, {
                // use dataset instead of reader
                dataset: postProcessDataset(ds, meta),
                reader: null,
              });
            }

            const sources = ReaderFactory.registerReadersToProxyManager(
              [{ ...readerBundle, proxyKeys: f.proxyKeys }],
              proxyManager
            );
            ret = ret.concat(sources.filter(Boolean));
          }
          return ret;
        };

        loadFiles(regularFiles);
        const loadedLabelmaps = loadFiles(labelmapFiles);

        const sources = proxyManager
          .getSources()
          .filter((p) => p.getProxyName() === 'TrivialProducer');

        // attach labelmaps to most recently loaded image
        if (sources[sources.length - 1]) {
          console.log(`attach labelmaps`);
          console.log(state);
          const lastSourcePID = sources[sources.length - 1].getProxyId();
          for (let i = 0; i < loadedLabelmaps.length; i++) {
            const lmProxy = loadedLabelmaps[i];
            console.log(`widgets/addLabelmapToImage`);
            dispatch(
              'widgets/addLabelmapToImage',
              {
                imageId: lastSourcePID,
                labelmapId: lmProxy.getProxyId(),
              },
              { root: true }
            ).then(() =>
              dispatch(
                'widgets/setLabelmapState',
                {
                  labelmapId: lmProxy.getProxyId(),
                  labelmapState: {
                    selectedLabel: 1,
                    lastColorIndex: 1,
                  },
                },
                { root: true }
              )
            );
          }
        }
      });

      return promise.finally(() => {
        commit('stopLoading');
        console.log(`stopLoading`);
      });
    },
  },
});
