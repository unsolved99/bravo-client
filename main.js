/*
     Bravo client v1.0
     Created by Unsolved99
*/

// Player
const player = {
    wsServer: "",
    partyToken: "",
    wsServerToken: "",

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
        this.sendPayload(15, `lastSentPartyToken`, player.partyToken);
        this.sendPayload(16, 'lastSentServerToken', player.wsServerToken);

    };


};
class Agartool{};

const chatApi = {
    server1: Ogario,
    server2: Agartool // Not sure yet what the purpose of this will be
};



// Client
const agarioConfig = {
    protocolVersion: 23,
    clientVersion: 31107,
    clientKey: null,
    protocolKey: null,
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
        this.integrity = ws.indexOf('agar.io') > -1
        this.protocolVersion = agarioConfig.protocolVersion;
        this.clientVersion = agarioConfig.clientVersion;
        this.clientKey = agarioConfig.clientKey; 
        this.protocolKey = agarioConfig.protocolKey;
        this.socket_opened = false;
        this.connect(this.ws);
    };
    
    connect(ws){
        
        jslogger.debug(`${this.type}`, `Connecting to ${ws}`);

        this.socket = new WebSocket(ws);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onopen = this.onOpen.bind(this);
    };

    onOpen() {

        jslogger.success(`${this.type}`, `Connected to ${ws}`);


        this.socket_opened = true;

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


