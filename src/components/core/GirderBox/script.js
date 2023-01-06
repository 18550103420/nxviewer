import SvgIcon from 'nxviewer/src/components/widgets/SvgIcon';
import Datasets from 'nxviewer/src/components/core/Datasets';
import writeImageArrayBuffer from 'itk/writeImageArrayBuffer';
import ReaderFactory from 'nxviewer/src/io/ReaderFactory';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';

export default {
  name: 'GirderBox',
  components: {
    SvgIcon,
    Datasets,
  },
  inject: ['$notify'],
  data() {
    return {
      selected: [],
      internalLocation: null,
      inputJsonUrl: null,
      pkSubjectData: null,
      imageList: [],
      rFilesList: [],
    };
  },
  mounted() {
    // TODO these can be moved to store when we add girder
    // state to store
    this.$root.$on('girder_upload_proxy', (proxyId) => {
      this.upload(proxyId);
    });
    this.inputJsonUrl = decodeURIComponent(this.GetInputUrl());
    // console.log(this.inputJsonUrl);

    if (this.inputJsonUrl.length > 0) {
      try {
        const req = new XMLHttpRequest();
        req.open('GET', this.inputJsonUrl, false);
        req.send();
        if (req.status === 200) {
          const inputJSON = JSON.parse(req.response);
          inputJSON.forEach((f) => {
            f.Url.forEach((u, index) => {
              let fname = '';
              if (f.Type.includes('dcm')) {
                fname = `${f.Description} - ${index + 1}.dcm`;
              } else if (f.Type.includes('label')) {
                this.pkSubjectData = f.PkSubjectData;
                fname = f.Description;
              }
              this.imageList.push({
                name: fname,
                inputType: f.Type,
                url: u,
                pkSubjectData: f.PkSubjectData,
              });
            });
          });
          this.downloadFiles().then(() => {
            this.$store.dispatch('files/openFiles', this.rFilesList);
          });
        } else {
          console.log(`Request ERROR!(req.status:${req.status})`);
        }
      } catch (err) {
        console.log(err);
      }
    }
  },
  methods: {
    downloadFiles() {
      const downloadPromises = [];
      this.imageList.forEach((image) => {
        downloadPromises.push(
          ReaderFactory.downloadDataset(image.name, image.url, {}).then(
            (getFile) => {
              this.rFilesList.push({
                neuroDataType: image.inputType,
                dispName: image.name,
                file: getFile,
              });
              // this.rFilesList.push(file);
            }
          )
        );
      });

      return Promise.all(downloadPromises);
    },
    GetInputUrl() {
      const url = window.location.toString();
      const arrObj = url.split('?');
      if (arrObj.length > 1) {
        let inputUrl = '';
        for (let i = 1; i < arrObj.length; i++) {
          if (i > 1) {
            inputUrl += '?';
          }
          inputUrl += arrObj[i];
        }
        return inputUrl;
      }
      return '';
    },
    GetUrlParam(paraName) {
      const url = window.location.toString();
      const arrObj = url.split('?');
      if (arrObj.length > 1) {
        const arrPara = arrObj[1].split('&');
        let arr;
        for (let i = 0; i < arrPara.length; i++) {
          arr = arrPara[i].split('=');
          if (arr != null && arr[0] === paraName) {
            return arr[1];
          }
        }
        return '';
      }
      return '';
    },
    export2pc(proxyId) {
      const dataset = this.$proxyManager.getProxyById(proxyId).get().dataset;

      const image = ITKHelper.convertVtkToItkImage(dataset);
      // If we don't copy here, the renderer's copy of the ArrayBuffer
      // becomes invalid because it's been transferred:
      image.data = image.data.slice(0);
      writeImageArrayBuffer(null, false, image, 'out.mha').then(
        function recieve({ arrayBuffer }) {
          const blob = new Blob([arrayBuffer]);
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.setAttribute('href', url);
          anchor.setAttribute('download', 'out.mha');

          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
        }
      );
    },
    checkUploadPossible() {
      // if need!
      return true;
    },
    upload(proxyId) {
      console.log(`upload!`);
      if (!this.checkUploadPossible()) {
        return;
      }
      const dataset = this.$proxyManager.getProxyById(proxyId).get().dataset;

      const metadata = {
        neuroDataType: dataset.getClassName(),
      };

      if (dataset.getClassName() === 'vtkLabelMap') {
        Object.assign(metadata, {
          colorMap: dataset.getColorMap(),
        });
      }

      this.$notify('Uploading...', true);

      const image = ITKHelper.convertVtkToItkImage(dataset);
      // If we don't copy here, the renderer's copy of the ArrayBuffer
      // becomes invalid because it's been transferred:
      image.data = image.data.slice(0);
      writeImageArrayBuffer(
        null,
        false,
        image,
        this.$proxyManager.getProxyById(proxyId).get().name
      ).then((valueReturned) => {
        const t = new Date();
        let fileName = `${t.getFullYear()}${
          t.getMonth() + 1
        }${t.getDate()}_${t.getHours()}-${t.getMinutes()}-${t.getSeconds()}-`;
        fileName += this.$proxyManager.getProxyById(proxyId).get().name;
        const buffer = valueReturned.arrayBuffer;
        const blob = new Blob([buffer]);
        const file = new File([blob], fileName);
        const param = new FormData();
        const SparkMD5 = require('spark-md5');
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onloadend = (e) => {
          const spark = new SparkMD5.ArrayBuffer();
          spark.append(e.target.result);
          const md5Str = spark.end();
          // const md5Str = SparkMD5.hash(e.target.result);
          param.append('Md5', md5Str);
          param.append('File', file);
          param.append('PkSubjectData', this.pkSubjectData);
          param.append('FileName', fileName);
          param.append('Ext', 'nii.gz');
          const req = new XMLHttpRequest();
          const postUrl = 'http://192.168.50.199:9002/apiv1/dicom/label';
          req.open('POST', postUrl, true);
          req.send(param);
          req.onreadystatechange = () => {
            if (req.readyState === 4) {
              const rspJSON = JSON.parse(req.response);
              if (rspJSON.success) {
                this.$notify('LabelImage uploaded Success!');
              } else {
                this.$notify(`Upload error(errorCode:${rspJSON.errorCode})`);
              }
            }
          };
        };
      });
    },
  },
};
