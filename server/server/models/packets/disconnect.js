var Packet = require("./packet.js");
let Matter = require("../../matter.js");
var Service = require("../game/service.js");

class DisconnectPacket extends Packet {
    constructor() {
        super();
    }

    handle(player) {
        if (player)
        {
            player.connected = false;
            console.log("The player, " + player.id + ", has closed their connection to the server.");

            // Send message to every connected client except the sender
            Matter.World.remove(global.world.engine.world, player.body);
            player.client.broadcast.emit('remove_player', {id: player.id});
            delete global.world.players[player.id];
            delete global.world.basePlayers[player.id];
        }
    }

    static getPacketName() {
        return "disconnect";
    }

}

module.exports = DisconnectPacket;