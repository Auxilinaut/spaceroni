var Packet = require("./packet.js")
var Service = require("../game/service.js")

class MovementPacket extends Packet {

    constructor(data) {
        super();
        this.move = data.move;
        this.rotate = data.rotate;
        this.shoot = data.shoot;
        this.dash = data.dash;
    }


    handle(player) {
        //console.log(this.move)
        global.world.onPlayerInput(player.id, this.move, this.rotate, this.shoot, this.dash);

        /*var moveplayerData = {
            id: player.id,
            x: player.x,
            y: player.y,
            angle: player.angle
        }*/

        //send message to every connected client except the sender
        //player.client.broadcast.emit('move_player', moveplayerData);
    }

    static getPacketName() {
        return "movement";
    }

}

module.exports = MovementPacket;