<template>
  <div class="about">
    <vue-dropzone ref="myVueDropzone" id="dropzone" @vdropzone-file-added="addFile" :options="dropzoneOptions"></vue-dropzone>
    <button @click="upload">Upload</button>
    <div id="progress">Progress</div>
  </div>
</template>
<script>
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import WSUploadV2 from '@/plugins/wsuploadv2'
const wsup = new WSUploadV2()
export default {
  name: 'app',
  components: {
    vueDropzone: vue2Dropzone
  },
  data: function () {
    return {
      dropzoneOptions: {
        url: 'https://httpbin.org/post',
        thumbnailWidth: 150,
        maxFilesize: 0.5
      }
    }
  },
  methods: {
    addFile (file) {
      this.file = file
    },
    upload () {
      wsup.Upload(this.file)
    }
  },
  mounted () {
    wsup.Init('progress')
  }
}
</script>
