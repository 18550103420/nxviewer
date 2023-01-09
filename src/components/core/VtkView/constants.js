export const DEFAULT_VIEW_TYPE = 'View2D_Z:z';

export const VIEW_TYPES = [
  { text: 'Orientation Z', value: 'View2D_Z:z' },
  { text: 'Orientation Y', value: 'View2D_Y:y' },
  { text: 'Orientation X', value: 'View2D_X:x' },
];

export const VIEW_TYPES_LPS = [
  { text: 'Axial', value: 'View2D_Z:z' },
  { text: 'Sagittal', value: 'View2D_Y:y' },
  { text: 'Coronal', value: 'View2D_X:x' },
];

/* eslint-disable  no-template-curly-in-string */
export const CURSOR_ANNOTATIONS = {
  se: '${valueArCursor}<br>${cursorIJK}&nbsp;/&nbsp;${cursorXYZ}<br>WL:&nbsp;${windowLevel}&nbsp;/&nbsp;WW:&nbsp;${windowWidth}',
};

export const ANNOTATIONS = {
  s: 'Image&nbsp;size:&nbsp;${sliceWidth}&nbsp;x&nbsp;${sliceHeight}',
  nw: 'Origin:&nbsp;${sliceOrigin}<br>Spacing:&nbsp;${sliceSpacing}&nbsp;mm<br>${sliceIndex}&nbsp;of&nbsp;${sliceCount}',
  se: 'WL:&nbsp;${windowLevel}&nbsp;/&nbsp;WW:&nbsp;${windowWidth}',
};
/* eslint-enable no-template-curly-in-string */

export const VIEW_ORIENTATIONS = {
  default: {
    axis: 2,
    orientation: -1,
    viewUp: [0, -1, 0],
  },
  x: {
    axis: 0,
    orientation: 1,
    viewUp: [0, 0, 1],
  },
  y: {
    axis: 1,
    orientation: -1,
    viewUp: [0, 0, 1],
  },
  z: {
    axis: 2,
    orientation: -1,
    viewUp: [0, -1, 0],
  },
};
