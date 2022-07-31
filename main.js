/*
     Bravo client v1.0
     Created by Unsolved99
*/

// Player
const player = {

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
class Client {
    constructor(){
        this.clients = [];
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
    x: 0,
    y: 0,
    target: {
        x: 0,
        y: 0,
        scale: 1,
    },
    viewportScale: 1,
    playerZoom: 1,
    sizeScale: 1,
    scale: 1,
};


