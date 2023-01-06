import Vue from 'vue';

import {
  wrapMutationAsAction,
  remapIdKeys,
  remapIdList,
} from 'nxviewer/src/utils';

export default () => ({
  namespaced: true,
  state: {
    distanceUnitSymbol: 'mm',
    distanceUnitFactor: 1.0,

    // paint
    imageToLabelmaps: {}, // image id -> [labelmap ids]
    labelmapStates: {}, // labelmap id -> { selectedLabel, lastColorIndex }
  },
  mutations: {
    setDistanceUnitSymbol(state, symbol) {
      state.distanceUnitSymbol = symbol;
    },
    setDistanceUnitFactor(state, factor) {
      state.distanceUnitFactor = factor;
    },
    addLabelmapToImage(state, { imageId, labelmapId }) {
      if (!(imageId in state.imageToLabelmaps)) {
        Vue.set(state.imageToLabelmaps, imageId, []);
      }
      state.imageToLabelmaps[imageId].push(labelmapId);
    },
    setLabelmapState(state, { labelmapId, labelmapState }) {
      Vue.set(state.labelmapStates, labelmapId, labelmapState);
    },
    rewriteProxyIds(state, idMapping) {
      state.imageToLabelmaps = remapIdKeys(state.imageToLabelmaps, idMapping);
      state.labelmapStates = remapIdKeys(state.labelmapStates, idMapping);

      Object.keys(state.imageToLabelmaps).forEach((id) => {
        state.imageToLabelmaps[id] = remapIdList(
          state.imageToLabelmaps[id],
          idMapping
        );
      });
    },
  },
  actions: {
    addLabelmapToImage: wrapMutationAsAction('addLabelmapToImage'),
    setLabelmapState: wrapMutationAsAction('setLabelmapState'),
    setDistanceUnitSymbol: wrapMutationAsAction('setDistanceUnitSymbol'),
    setDistanceUnitFactor: wrapMutationAsAction('setDistanceUnitFactor'),
    rewriteProxyIds: {
      root: true,
      handler: wrapMutationAsAction('rewriteProxyIds'),
    },
    pxmProxyCreated: {
      root: true,
      handler() {},
    },
  },
});
