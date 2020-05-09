<template>
  <div class="about">
    <vue-dropzone ref="myVueDropzone" id="dropzone" @vdropzone-file-added="addFile" :options="dropzoneOptions"></vue-dropzone>
    <button @click="upload">Upload</button>
  </div>
</template>
<script>
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import WSUpload from '@/plugins/wsupload'
const wsup = new WSUpload()
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
        maxFilesize: 0.5,
        headers: { 'My-Awesome-Header"': 'header value' }
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
  }
}
</script>
