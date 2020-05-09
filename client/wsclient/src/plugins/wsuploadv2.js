var SparkMD5 = require("./jsmd5");
class WSUploadV2 {
  constructor() {
    WSUploadV2.prototype.GatewayServer = "ws://localhost:8086/ws";
  }
  Upload(file, options) {
    var chunkSize = 1024 * 1024 * 4;

    var socket = new WebSocket(WSUploadV2.prototype.GatewayServer);
    socket.onmessage = function (e) {
      if (e.data === "ready") {
        progress.innerHTML = progress.innerHTML.replace(
          "please wait...",
          " upload complete"
        );
        console.log("Received ready event");
      }
      if (e.data === "exists") {
        console.log("file already exists");
        socket.fileExists = true;
      }
    };
    var closeSocket = function () {
      if (socket.readyState !== 1) {
        console.log(socket.readyState);
        socket.close();
        setTimeout(function () {
          socket = new WebSocket(WSUploadV2.prototype.GatewayServer);
          if (typeof socket.onclose === "undefined")
            socket.onclose = closeSocket;
          socket.onmessage = function (e) {
            if (e.data === "ready") {
              progress.innerHTML = progress.innerHTML.replace(
                "please wait...",
                " upload complete"
              );
              console.log("Received ready event");
            }
            if (e.data === "exists") {
              // console.log('file already exists')
              socket.fileExists = true;
            }
          };
        }, 5000);
      }
    };
    socket.onclose = closeSocket;
    function parseFile(file, options) {
      var fileSize = file.size;
      var offset = 0;
      var readBlock = null;
      var chunkReadCallback = function (data) {
        console.log(data);
        if (!socket.fileExists) socket.send(data);
      };
      var chunkErrorCallback = function (err) {
        console.log("ERROR", err);
      };
      var result = function (msg, count) {
        console.log(msg + " " + count);
        socket.fileExists = false;
      };
      var onLoadHandler = function (evt) {
        if (evt.target.error == null) {
          offset += evt.loaded;
          chunkReadCallback(evt.target.result);
        } else {
          chunkErrorCallback(evt.target.error);
          return;
        }
        var percentage = Math.round((offset / fileSize) * 100);
        progress.innerHTML =
          file.name +
          " (MD5=" +
          socket.uploadChecksum +
          ") " +
          " &nbsp; " +
          percentage +
          "% processed, please wait...";
        progress.style.width = percentage + "%";

        if (offset === fileSize) {
          result("Success!", offset);
          socket.send("ready:" + offset);
          return;
        } else if (offset > fileSize) {
          result("Fail!", offset);
          return;
        }
        readBlock(offset, chunkSize, file);
      };
      readBlock = function (_offset, length, _file) {
        var r = new FileReader();
        var blob = _file.slice(_offset, length + _offset);
        r.onload = onLoadHandler;
        r.readAsArrayBuffer(blob);
      };
      readBlock(offset, chunkSize, file);
    }

    function getFileChecksum(file, options) {
      var fileSize = file.size;
      var spark = new SparkMD5.ArrayBuffer();
    //   console.log(spark)
      var offset = 0;
      var readBlock = null;
      var chunkReadCallback = function (data) {
        spark.append(data);
      };
      var chunkErrorCallback = function (err) {
        console.log("ERROR", err);
      };
      var onLoadHandler = function (evt) {
        if (evt.target.error == null) {
          offset += evt.loaded;
          chunkReadCallback(evt.target.result);
        } else {
          chunkErrorCallback(evt.target.error);
          return;
        }
        var percentage = Math.round((offset / fileSize) * 100);
        progress.innerHTML =
          "Calculating MD5 for " + file.name + " &nbsp; " + percentage + "%";
        progress.style.width = percentage + "%";
        if (offset === fileSize) {
          socket.uploadChecksum = spark.end();
          socket.send("upload:" + socket.uploadChecksum + ":" + file.name);
          parseFile(file);
          return;
        } else if (offset > fileSize) {
          return;
        }
        readBlock(offset, chunkSize, file);
      };
      readBlock = function (_offset, length, _file) {
        var r = new FileReader();
        var blob = _file.slice(_offset, length + _offset);
        r.onload = onLoadHandler;
        r.readAsArrayBuffer(blob);
      };
      readBlock(offset, chunkSize, file);
    }
    getFileChecksum(file)
  }
  Init(tagId) {
    var progress = document.getElementById(tagId);
    progress.style.background = "#396";
    progress.style.color = "#fff";
    progress.style.fontWeight = "bold";
    progress.style.padding = "5px";
    progress.style.display = "block";
    progress.style.height = "20px";
    progress.style.whiteSpace = "nowrap";
  }
}
export default WSUploadV2;
