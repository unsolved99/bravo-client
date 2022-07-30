/*
     Bravo client v1.0
     Created by Unsolved99
*/

// Player
const player = {
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
    };

    connect(server){

        jslogger.info('OGARIO', 'Connecting..');
        this.socket = new WebSocket(server);
        this.socket.ogarioWS = true;
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => {
            jslogger.success('OGARIO', 'Connection established!');
            toastr.success('Connected to chat server!');
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
    }

    isSocketOpen() {
        return this.socket !== null && this.socket.readyState === this.socket.OPEN;
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


