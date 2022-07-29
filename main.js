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
class Ogario {};
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


