/*
     Bravo client v1.0
     Created by Unsolved99
*/

const servers = {
     arctida: {
          wss: "wss://imsolo.pro:2109",
          token: "aW1zb2xvLnBybzoyMTA5",
     },
     rookery: {
          wss: "wss://imsolo.pro:2104/",
          token: "aW1zb2xvLnBybzoyMTA0Lw==",
     },
};

const server_config = {
     imsolopro: {
          protocol: 22,
          client_version: 31107,
     },

};

class Client {
     constructor(type, server){

          this.type = type;
          this.server = server;

          
          this.connect(this.server);
     };

     connect(server){
          this.socket = new WebSocket(server);
          this.socket.binaryType = 'arraybuffer';
          this.socket.onmessage = this.onMessage.bind(this);
          this.socket.onerror = this.onError.bind(this);
          this.socket.onclose = this.onClose.bind(this);
          this.socket.onopen = this.onOpen.bind(this);
  
          jslogger.debug(`${this.type}`, `Connecting to ${server}`);
     };

     onOpen() {

        // Sending protocol version
        let protocol_version = this.createView(5);
        protocol_version.setUint8(0, 254);
        protocol_version.setUint32(1, server_config.imsolopro.protocol, true);
        this.sendBuffer(protocol_version);

        // Sending client version
        let client_version = this.createView(5);
        client_version.setUint8(0, 255);
        client_version.setUint32(1, server_config.imsolopro.client_version, true);
        this.sendBuffer(client_version);

       // Send ping
        clearInterval(this.pingLoop);
        this.pingLoop = setInterval( () => {
          this.sendBuffer(new Uint8Array([254]));
      }, 500);

      jslogger.success(`${this.type}`, `Connected ${this.server}`);
      toastr.success(`<b>[${this.type}]</b> Connected!`);

     };

     onClose() {
          jslogger.warning(`${this.type}`, `Disconnected ${this.server}`);
          toastr.warning(`<b>[${this.type}]</b> Disconnected!`);
          clearInterval(this.pingLoop);
     };
     onError() {

          jslogger.error(`${this.type}`, `Can't connect ${this.server}`);
          toastr.error(`<b>[${this.type}]</b> Failed to connect!`);

     };
     onMessage(event) {

     };
     isSocketOpen() {
          return this.socket !== null && this.socket.readyState === this.socket.OPEN;
     };
     createView(value) {
          return new DataView(new ArrayBuffer(value));
     };
     sendBuffer(data){
          this.socket.send(data.buffer);
     };
};