/*
     Bravo client v1.0
     Created by Unsolved99
*/

// Player
const player = {
    ws: "",
    ws_token: "",
    party_token: "",

    profile: {
        nickname: "",
        clanTag: "",
        skin: "",
        skin2: "",
        colorCell: "",
    },

    mouseCoords: {x: 0, y: 0},

    gameSettings: {
        animationDelay: 140,
        jellyPhysics: false,
        showMyName: true,
        showMyMass: true,
        showEveryonesName: true,
        showEveryonesMass: true,
        showLeaderboard: true,
        showLeaderboardMass: false,
        ShowTeamTop5: true,
        showFPS: true,
        showPING: true,
        unlockZoom: false, // Can scroll out more
        showGrid: false,
        showMapBorders: true,
        borderSize: 1,
        enableMultibox: false,
        showChat: false,
    },
    
    themeSettings: {
        backgroundColor: "#ffffff",
        borderColor: "#ff0000",
        gridColor: "e6e6e6",
    },
};

//Communication servers
class Ogario {
    constructor(){
        this.chatServer = "wss://snez.dev:8080/ws?030";
        this.errorCount = 0;
        this.maxErrors = 15;  
        this.connect(this.chatServer);  
    };

    connect(server){

        jslogger.debug('OGARIO', 'Connecting..');
        this.socket = new WebSocket(server);
        this.socket.ogarioWS = true;
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
            jslogger.success('OGARIO', 'Connection established!');
            toastr.success('Connected to chat server!');
            const buf = this.createView(3);
            buf.setUint8(0,0);
            buf.setUint16(1, 401, true);
            this.sendBuffer(buf);
            buf.setUint8(0, 5);
            buf.setUint16(1, 40, true);
            this.sendBuffer(buf);
            this.payload();
            this.errorCount = 0;

        };

        this.socket.onclose = () => {

            if (this.errorCount < this.maxErrors) {
                jslogger.warning('OGARIO', 'Reconnecting..');
                this.reconnect();
                this.errorCount++;
             } else {
                this.cleanUp();
                this.closeConnection();
            }
        };

        this.socket.onerror = (error) => {
            jslogger.error('OGARIO', 'Failed to established');
        };

    };

    reconnect(){

        setTimeout(() => {
            this.connect(this.chatServer);
        }, 1000);

    };

    cleanUp(){

        this.errorCount = 0;

    };

    closeConnection(){

        this.socket.close();

    };

    isSocketOpen() {

        return this.socket !== null && this.socket.readyState === this.socket.OPEN;

    };

    createView(value) {

        return new DataView(new ArrayBuffer(value));

    };
    
    sendBuffer(value) {
        this.socket.send(value.buffer);
    };

    stringToBuff(offset, string) {
        const view = this.createView(1 + string.length * 2);
        view.setUint8(0, offset);

        for (let length = 0; length < string.length; length++) {
            view.setUint16(1 + length * 2, string.charCodeAt(length), true);
        }
        
        return view;
    }

    sendPayload(offset, name, string) {

        if (this[name] !== null && this[name] === string) {
            return;
        }
        if (this.isSocketOpen()) {
            this.sendBuffer(this.stringToBuff(offset, string));
            this[name] = string;
        }
    };

    payload(){

        this.sendPayload(10, `lastSentNick`, player.profile.nickname);
        this.sendPayload(11, `lastSentClanTag`, player.profile.clanTag);
        this.sendPayload(15, `lastSentPartyToken`, player.party_token);
        this.sendPayload(16, 'lastSentServerToken', player.ws_token);

    };


};
class Agartool{};

const chatApi = {
    server1: Ogario,
    server2: Agartool // Not sure yet what the purpose of this will be
};

// Client
const config = {
    agario: {
        protocol_version: 23,
        client_version: 31107,
        client_key: null,
        protocol_key: null,
    },
    imsolopro: {
        protocol_version: 22,
    },
};

const opCodes = Object.freeze({
    SOCKET_CONNECTING: 0,
    SOCKET_OPENED: 1,
    SOCKET_CLOSING: 2,
    SOCKET_CLOSED: 3,
    VIEWPORT_UPDATE: 17,
    FLUSH: 18,
    ADD_OWN_CELL: 32,
    LEADERBOARD: 53,
    LEADERBOARD2: 54,
    GHOST_CELLS: 69,
    RECAPTCHA_V2: 85,
    RECAPTCHA_V3: 87,
    MOBILE_DATA: 102,
    TOKEN_ACCEPTED: 103,
    SERVER_DEATH: 113,
    SPECTATE_MODE_IS_FULL: 114,
    OUTDATED_CLIENT_ERROR: 128,
    PING_PONG: 226,
    GENERATE_KEYS: 241,
    SERVER_TIME: 242,
    COMPRESSED_MESSAGE: 255
});

class Client {

    constructor(type, ws){

        this.type = type;
        this.ws = ws;

        this.socket = null;
        this.socket_opened = false;

        this.integrity = ws.indexOf('agar.io') > -1

        this.protocol_version = config.agario.protocol_version;
        this.sub_protocol_version = config.imsolopro.protocol_version;
        this.client_version = config.agario.client_version;

        this.client_key = config.agario.client_key; 
        this.protocol_key = config.agario.protocol_key;
        

        this.connect(this.ws);
    };
    
    connect(ws){
        
        this.socket = new WebSocket(ws);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onopen = this.onOpen.bind(this);

        jslogger.debug(`${this.type}`, `Connecting to ${ws}`);
    };

    onOpen() {

        // Sending protocol version
        let protocol_version = this.createView(5);
        protocol_version.setUint8(0, 254);
        protocol_version.setUint32(1, this.integrity ? this.protocol_version : this.sub_protocol_version, true);
        this.sendMessage(protocol_version);

        // Sending client version
        let client_version = this.createView(5);
        client_version.setUint8(0, 255);
        client_version.setUint32(1, this.client_version, true);
        this.sendMessage(client_version);

        this.socket_opened = true;

        jslogger.success(`${this.type}`, `Connected to ${ws}`);
        toastr.success(`[${this.type}] Connected to ${ws}`);

    };

    onMessage(event) {

        event = new DataView(event.data);

        if (this.protocol_key){
            event = this.shift_message(event, this.protocol_key ^ this.client_version);
        }

        this.protocol_handeler(event);

    };

    onClose(event) {};
    onError(event) {};


    isSocketOpen() {
        return this.socket !== null && this.socket.readyState === this.socket.OPEN;
    };

    sendMessage(msg) {

        if (this.socket_opened && this.integrity) {
            if (!this.client_key) {
                return;
            }
            msg = this.shift_message(msg, this.client_key);
            this.client_key = this.shift_key(this.client_key);
        }

        this.sendBuffer(msg);
        
    };

    createView(value) {
        return new DataView(new ArrayBuffer(value));
    };

    sendBuffer(data){
        this.socket.send(data.buffer);
    };

    protocol_handeler(view){

        const encode = () => {
            for (let text = '';;) {
                const string = view.getUint8(offset++);
                if (string == 0) {
                    break;
                }
                text += String.fromCharCode(string);
            }
            return text;
        };

        var offset = 0;
        let opCode = view.getUint8(offset++);

        
        if (opCode == 54) { 
            opCode = 53;
        }

        // Handeling opCodes
        switch (opCode) {
            // SOCKET_CONNECTING
            case opCodes.SOCKET_CONNECTING :
                break;
            // SOCKET_OPENED
            case opCodes.SOCKET_OPENED:
                break;
            // SOCKET_CLOSING
            case opCodes.SOCKET_CLOSING:
                break;
            // SOCKET_CLOSED
            case opCodes.SOCKET_CLOSED:
                break;
            //FLUSH
            case opCodes.FLUSH:
                if (this.protocol_key) {
                    this.protocol_key = this.shift_key(this.protocol_key);
                }
                break;

            // PING_PONG
            case opCodes.PING_PONG:
                const ping = view.getUint16(1, true);
                view = this.createView(3);
                view.setUint8(0,227);
                view.setUint16(1, ping);
                this.sendMessage(view);
                jslogger.debug(`${this.type}`, `[Protocol ${opCodes.PING_PONG}] Ping Pong`);
                break;

            // GENERATE_KEYS
            case opCodes.GENERATE_KEYS:
                this.protocol_key = view.getUint32(offset, true);
                jslogger.debug(`${this.type}`, `[Protocol ${opCodes.GENERATE_KEYS}] Received protocol key: ${this.protocol_key}`);
                
                const agarioReader = new Uint8Array(view.buffer, offset += 4);
                this.clientKey = this.generate_client_key(this.ws, agarioReader);
                break;

            //SERVER_TIME
            case opCodes.SERVER_TIME:
                //var serverTime = view.getUint32(offset, true) * 1000;
                //console.log(`[Protocol 242] Received server time: ${serverTime}`);

        }
    };

    shift_message(view, key, write) {
        if (!write) {
            for (var length = 0; length < view.byteLength; length++) {
                view.setUint8(length, view.getUint8(length) ^ key >>> length % 4 * 8 & 255);
            }
        } else {
            for (var length = 0; length < view.length; length++) {
                view.writeUInt8(view.readUInt8(length) ^ key >>> length % 4 * 8 & 255, length);
            }
        }
        return view;
    };

    shift_key(key) {
        const value = 1540483477;
        key = Math.imul(key, value) | 0;
        key = (Math.imul(key >>> 24 ^ key, value) | 0) ^ 114296087;
        key = Math.imul(key >>> 13 ^ key, value) | 0;
        return key >>> 15 ^ key;
    };

    generate_client_key(ip, options) {

        if (!ip.length || !options.byteLength) {
            return null;
        }

        let client_key = null;

        const Length = 1540483477;
        const ipCheck = ip.match(/(ws+:\/\/)([^:]*)(:\d+)/)[2];
        const newLength = ipCheck.length + options.byteLength;
        const uint8Arr = new Uint8Array(newLength);

        for (let length = 0; length < ipCheck.length; length++) {
            uint8Arr[length] = ipCheck.charCodeAt(length);
        }

        uint8Arr.set(options, ipCheck.length);
        const dataview = new DataView(uint8Arr.buffer);

        let type = newLength - 1;
        const value = (type - 4 & -4) + 4 | 0;
        let newValue = type ^ 255;
        let offset = 0;

        while (type > 3) {
            client_key = Math.imul(dataview.getInt32(offset, true), Length) | 0;
            newValue = (Math.imul(client_key >>> 24 ^ client_key, Length) | 0) ^ (Math.imul(newValue, Length) | 0);
            type -= 4;
            offset += 4;
        }

        switch (type) {
            case 3:
                newValue = uint8Arr[value + 2] << 16 ^ newValue;
                newValue = uint8Arr[value + 1] << 8 ^ newValue;
                break;
            case 2:
                newValue = uint8Arr[value + 1] << 8 ^ newValue;
                break;
            case 1:
                break;
            default:
                client_key = newValue;
                break;
        }

        if (client_key != newValue) {
            client_key = Math.imul(uint8Arr[value] ^ newValue, Length) | 0;
        }

        newValue = client_key >>> 13;
        client_key = newValue ^ client_key;
        client_key = Math.imul(client_key, Length) | 0;
        newValue = client_key >>> 15;
        client_key = newValue ^ client_key;

        jslogger.debug(`${this.type}`, `Generated client key: ${client_key}`);

        return client_key;
    };

    decompressBuffer(input, output) {
        for (let i = 0, j = 0; i < input.length;) {
            const byte = input[i++]
            let literalsLength = byte >> 4
            if (literalsLength > 0) {
                let length = literalsLength + 240
                while (length === 255) {
                    length = input[i++]
                    literalsLength += length
                }
                const end = i + literalsLength
                while (i < end) output[j++] = input[i++]
                if (i === input.length) return output
            }
            const offset = input[i++] | (input[i++] << 8)
            if (offset === 0 || offset > j) return -(i - 2)
            let matchLength = byte & 15
            let length = matchLength + 240
            while (length === 255) {
                length = input[i++]
                matchLength += length
            }
            let pos = j - offset
            const end = j + matchLength + 4
            while (j < end) output[j++] = output[pos++]
        }
        return output
    };

    decompressMessage(message) {

        const buffer = window.buffer.Buffer;
        const messageBuffer = new buffer(message.buffer);
        const readMessage = new buffer(messageBuffer.readUInt32LE(1));

        LZ4.decodeBlock(messageBuffer.slice(5), readMessage);

        return readMessage;
    };
    

}

// Multibox
class Multibox {
    constructor(){
        this.tabs = [];
    }

};

// Rendering
const camera = {

};


