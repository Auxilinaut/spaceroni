var Packet = require("./packet.js");
var Service = require("../game/service.js");
var BasePlayer = require("../users/baseplayer.js");

class ConnectPacket extends Packet {
    constructor(data) {
        super();
        this.data = data;
    }

    handle(player) {
        console.log("Connected")
        player.base64 = this.data.base64;
        player.name = player.id;
        console.log("Name:" + this.data.name);
        if (this.data.name != undefined)
            player.name = this.data.name;
        else
            player.name = player.id;
        player.x = Math.random() * (global.world.size[0]-100) + 50;
        player.y = Math.random() * (global.world.size[1]-100) + 50;
        player.angle = Math.random() * 2 * Math.PI;
        player.connected = true;

        player.client.emit('place_player', {
            id : player.id,
            x: player.x,
            y: player.y,
            angle : 180 * player.angle / Math.PI,
        });

        player.createBody();

        var current_info = {
            id: player.id,
            x: player.x,
            y: player.y,
            angle: 180 * player.angle / Math.PI,
            base64: player.base64,
            name: player.name
        };

        //send to the new player about everyone who is already connected.

        //send message to the sender-client only
        if (Object.keys(global.world.players).length > 0) player.client.emit("existing_players", Object.values(global.world.basePlayers));
        //console.dir(Object.values(global.world.players));

        var newPlayer = new BasePlayer(current_info);
        global.world.players[player.id] = player;
        global.world.basePlayers[player.id] = newPlayer;
        //send message about new player to every connected client except the new player
        player.client.broadcast.emit('new_player', current_info);
    }

    static getPacketName() {
        return "connect";
    }
}

module.exports = ConnectPacket;