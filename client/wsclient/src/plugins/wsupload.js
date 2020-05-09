class WSUpload {
  constructor () {
    WSUpload.prototype.GatewayServer = 'ws://192.168.1.133:8558/upload'
  }

  Upload (file) {
    const websocket = new WebSocket(WSUpload.prototype.GatewayServer)
    websocket.binaryType = 'blob'
    websocket.onopen = () => {
      websocket.send(file)
    }
    websocket.onerror = (e) => {
      console.error(e)
    }
    websocket.onclose = () => {
      console.log('Connection closed')
    }
  }
}
export default WSUpload
