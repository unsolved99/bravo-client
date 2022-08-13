class PacketEncoder {
    sendSpawn(client, nick, token){

    };
    sendSplit(client){

    };
    sendFeed(client){

    };
    sendSpectate(client){

    };
    sendFreeSpectate(client){

    };

    sendHandshake(client, serverInfo){

    };
    sendMouseMove(client, x = 0, y = 0) {

    }
    actionPacket(opCode) {
        return new Uint8Array([opCode]).buffer;
    };
};
