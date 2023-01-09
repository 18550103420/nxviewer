import vtk2DView from '@kitware/vtk.js/Proxy/Core/View2DProxy';
import vtkGeometryRepresentationProxy from '@kitware/vtk.js/Proxy/Representations/GeometryRepresentationProxy';
import vtkSkyboxRepresentationProxy from '@kitware/vtk.js/Proxy/Representations/SkyboxRepresentationProxy';
import vtkLookupTableProxy from '@kitware/vtk.js/Proxy/Core/LookupTableProxy';
import vtkPiecewiseFunctionProxy from '@kitware/vtk.js/Proxy/Core/PiecewiseFunctionProxy';
import vtkProxySource from '@kitware/vtk.js/Proxy/Core/SourceProxy';

import vtkTextWidget from 'nxviewer/src/vtk/TextWidget';
import vtkPaintWidget from '@kitware/vtk.js/Widgets/Widgets3D/PaintWidget';

import vtkCustomSliceRepresentationProxy from 'nxviewer/src/vtk/CustomSliceRepresentationProxy';
import vtkCustomVolumeRepresentationProxy from 'nxviewer/src/vtk/CustomVolumeRepresentationProxy';
import vtkLabelMapVolumeRepProxy from 'nxviewer/src/vtk/LabelMapVolumeRepProxy';
import vtkLabelMapSliceRepProxy from 'nxviewer/src/vtk/LabelMapSliceRepProxy';
import vtkWidgetProxy from 'nxviewer/src/vtk/WidgetProxy';

import ConfigUtils from 'nxviewer/src/config/configUtils';

import proxyUI from 'nxviewer/src/config/proxyUI';
import proxyLinks from 'nxviewer/src/config/proxyLinks';
import proxyViewRepresentationMapping from 'nxviewer/src/config/proxyViewRepresentationMapping';

const { createProxyDefinition, activateOnCreate } = ConfigUtils;

const ViewToWidgetTypes = {
  View2D_X: 'SLICE',
  View2D_Y: 'SLICE',
  View2D_Z: 'SLICE',
};

function createDefaultView(classFactory, ui, options, props) {
  return activateOnCreate(
    createProxyDefinition(
      classFactory,
      ui,
      [
        {
          type: 'application',
          link: 'OrientationAxesVisibility',
          property: 'orientationAxesVisibility',
          updateOnBind: true,
        },
        {
          type: 'application',
          link: 'OrientationAxesPreset',
          property: 'presetToOrientationAxes',
          updateOnBind: true,
        },
        {
          type: 'application',
          link: 'OrientationAxesType',
          property: 'orientationAxesType',
          updateOnBind: true,
        },
      ],
      options,
      props
    )
  );
}

// ----------------------------------------------------------------------------
export default {
  definitions: {
    Proxy: {
      LookupTable: createProxyDefinition(vtkLookupTableProxy, [], [], {
        presetName: 'Default (Cool to Warm)',
      }),
      PiecewiseFunction: createProxyDefinition(vtkPiecewiseFunctionProxy),
    },
    Widgets: {
      Paint: createProxyDefinition(vtkWidgetProxy, [], [], {
        factory: vtkPaintWidget,
        viewTypes: ViewToWidgetTypes,
      }),
      Text: createProxyDefinition(vtkWidgetProxy, [], [], {
        factory: vtkTextWidget,
        viewTypes: ViewToWidgetTypes,
      }),
    },
    Sources: {
      TrivialProducer: activateOnCreate(createProxyDefinition(vtkProxySource)),
      // differentiate LabelMaps
      LabelMap: createProxyDefinition(vtkProxySource),
    },
    Representations: {
      Geometry: createProxyDefinition(
        vtkGeometryRepresentationProxy,
        proxyUI.Geometry,
        proxyLinks.Geometry
      ),
      Skybox: createProxyDefinition(
        vtkSkyboxRepresentationProxy,
        proxyUI.Skybox,
        proxyLinks.Skybox
      ),
      Slice: createProxyDefinition(
        vtkCustomSliceRepresentationProxy,
        proxyUI.Slice,
        proxyLinks.Slice
      ),
      SliceX: createProxyDefinition(
        vtkCustomSliceRepresentationProxy,
        proxyUI.Slice,
        [
          {
            link: 'SliceX',
            property: 'slice',
            updateOnBind: true,
            type: 'application',
          },
        ].concat(proxyLinks.Slice)
      ),
      SliceY: createProxyDefinition(
        vtkCustomSliceRepresentationProxy,
        proxyUI.Slice,
        [
          {
            link: 'SliceY',
            property: 'slice',
            updateOnBind: true,
            type: 'application',
          },
        ].concat(proxyLinks.Slice)
      ),
      SliceZ: createProxyDefinition(
        vtkCustomSliceRepresentationProxy,
        proxyUI.Slice,
        [
          {
            link: 'SliceZ',
            property: 'slice',
            updateOnBind: true,
            type: 'application',
          },
        ].concat(proxyLinks.Slice)
      ),
      Volume: createProxyDefinition(
        vtkCustomVolumeRepresentationProxy,
        proxyUI.Volume,
        proxyLinks.Volume
      ),
      LabelMapVolume: createProxyDefinition(
        vtkLabelMapVolumeRepProxy,
        [], // ui
        [] // links
      ),
      LabelMapSlice: createProxyDefinition(vtkLabelMapSliceRepProxy),
      LabelMapSliceX: createProxyDefinition(
        vtkLabelMapSliceRepProxy,
        [], // ui
        [
          {
            link: 'SliceX',
            property: 'slice',
            updateOnBind: true,
            type: 'application',
          },
        ] // links
      ),
      LabelMapSliceY: createProxyDefinition(
        vtkLabelMapSliceRepProxy,
        [], // ui
        [
          {
            link: 'SliceY',
            property: 'slice',
            updateOnBind: true,
            type: 'application',
          },
        ] // links
      ),
      LabelMapSliceZ: createProxyDefinition(
        vtkLabelMapSliceRepProxy,
        [], // ui
        [
          {
            link: 'SliceZ',
            property: 'slice',
            updateOnBind: true,
            type: 'application',
          },
        ] // links
      ),
    },
    Views: {
      View2D: createDefaultView(vtk2DView, proxyUI.View2D),
      View2D_X: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 0 }),
      View2D_Y: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 1 }),
      View2D_Z: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 2 }),
    },
  },
  representations: {
    View2D: proxyViewRepresentationMapping.View2D,
    View2D_X: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceX' },
      vtkLabelMap: { name: 'LabelMapSliceX' },
    },
    View2D_Y: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceY' },
      vtkLabelMap: { name: 'LabelMapSliceY' },
    },
    View2D_Z: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceZ' },
      vtkLabelMap: { name: 'LabelMapSliceZ' },
    },
  },
  filters: {
    vtkPolyData: [],
    vtkImageData: [],
  },
};
